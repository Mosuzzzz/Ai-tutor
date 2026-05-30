"""
Moved auth router into routers.public
"""
from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from auth import (
    create_access_token,
    generate_secure_token,
    hash_password,
    hash_secure_token,
    verify_password,
    create_refresh_token_record,
    resolve_refresh_token,
)
from database import get_db
from models import Tenant, User, AuditLog
import schemas

import services.email_service as email_service
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & SSO"])

VERIFICATION_TOKEN_EXPIRES_MINUTES = 60 * 24
RESET_TOKEN_EXPIRES_MINUTES = 60
MAGIC_LINK_TOKEN_EXPIRES_MINUTES = 15


def normalize_native_role(role: str) -> str:
    alias_map = {
        "student": "learner",
        "teacher": "trainer",
        "learner": "learner",
        "trainer": "trainer",
        "tenant_admin": "tenant_admin",
        "global_admin": "global_admin",
    }
    normalized = alias_map.get((role or "learner").strip().lower())
    if not normalized:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    return normalized


def build_personal_workspace_name(full_name: str, email: str) -> str:
    if full_name.strip():
        return f"{full_name.strip()} Workspace"
    local_part = email.split("@")[0].strip().replace(".", " ").replace("_", " ")
    return f"{local_part.title()} Workspace" if local_part else "Personal Workspace"


def build_user_payload(user: User) -> Dict[str, Any]:
    return {
        "user_id": user.id,
        "tenant_id": user.tenant_id,
        "email": user.email,
        "role": user.role,
    }


def create_and_store_token(user: User, token_field: str, expiry_field: str, minutes: int) -> str:
    token = generate_secure_token()
    setattr(user, token_field, hash_secure_token(token))
    setattr(user, expiry_field, datetime.utcnow() + timedelta(minutes=minutes))
    return token


def load_user_by_token(db: Session, token_field: str, token: str) -> User | None:
    token_hash = hash_secure_token(token)
    query = db.query(User).filter(getattr(User, token_field) == token_hash)
    return query.first()


@router.post("/register", response_model=schemas.AuthActionResponse)
def register_user(request: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """Explicit email/password registration. This does not auto-login the user."""
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    tenant = Tenant(
        company_name=((request.company_name or "").strip() or build_personal_workspace_name(request.full_name, request.email)),
        sso_domain=None,
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    user = User(
        tenant_id=tenant.id,
        email=request.email,
        full_name=request.full_name,
        role=normalize_native_role(request.role),
        auth_provider="local",
        password_hash=hash_password(request.password),
        email_verified_at=None,
    )
    verification_token = create_and_store_token(
        user,
        "verification_token_hash",
        "verification_token_expires_at",
        VERIFICATION_TOKEN_EXPIRES_MINUTES,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    db.add(
        AuditLog(
            tenant_id=tenant.id,
            user_id=user.id,
            action="REGISTER",
            details="Self-service registration completed; email verification required.",
            ip_address="127.0.0.1",
        )
    )
    db.commit()

    # Send verification email if SMTP is configured; otherwise return dev_token for local testing
    dev_token = verification_token
    if email_service.is_email_delivery_configured():
        try:
            email_service.send_verification_email(user.email, verification_token)
            dev_token = None
        except Exception:
            # Don't block registration on transient email send failures; keep dev_token for debugging
            pass

    return schemas.AuthActionResponse(
        message="Registration complete. Please verify your email before signing in.",
        email=user.email,
        user_id=user.id,
        tenant_id=tenant.id,
        requires_email_verification=True,
        expires_in=VERIFICATION_TOKEN_EXPIRES_MINUTES * 60,
        dev_token=dev_token,
    )

@router.post("/verify-email", response_model=schemas.AuthActionResponse)
def verify_email(request: schemas.TokenRequest, db: Session = Depends(get_db)):
    """Marks a local account as verified after the verification token is presented."""
    user = load_user_by_token(db, "verification_token_hash", request.token)
    if not user or not user.verification_token_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token is invalid")

    if user.verification_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token has expired")

    user.email_verified_at = datetime.utcnow()
    user.verification_token_hash = None
    user.verification_token_expires_at = None
    db.add(AuditLog(tenant_id=user.tenant_id, user_id=user.id, action="EMAIL_VERIFIED", details="Email verified", ip_address="127.0.0.1"))
    db.commit()

    return schemas.AuthActionResponse(
        message="Email verified successfully.",
        email=user.email,
        user_id=user.id,
        tenant_id=user.tenant_id,
    )


@router.post("/login", response_model=schemas.Token)
def login_password(request: schemas.LoginRequest, req_meta: Request, db: Session = Depends(get_db)):
    """Explicit email/password login. The account must exist and be email-verified."""
    user = db.query(User).filter(User.email == request.email, User.auth_provider == "local").first()
    if not user or not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.email_verified_at:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email before signing in")

    token_data = build_user_payload(user)
    expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str, expires_in = create_access_token(data=token_data, expires_delta=expires_delta)

    # Issue refresh token record
    refresh_token, refresh_expires_in = create_refresh_token_record(db, user)
    db.add(AuditLog(tenant_id=user.tenant_id, user_id=user.id, action="PASSWORD_LOGIN", details="Password login successful", ip_address=req_meta.client.host if req_meta and req_meta.client else "127.0.0.1"))
    db.commit()

    return schemas.Token(access_token=token_str, token_type="bearer", expires_in=expires_in, refresh_token=refresh_token, refresh_expires_in=refresh_expires_in)


@router.post("/forgot-password", response_model=schemas.AuthActionResponse)
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generates a password reset token without revealing whether the email exists."""
    user = db.query(User).filter(User.email == request.email, User.auth_provider == "local").first()
    dev_token = None

    if user and user.email_verified_at:
        dev_token = create_and_store_token(
            user,
            "reset_token_hash",
            "reset_token_expires_at",
            RESET_TOKEN_EXPIRES_MINUTES,
        )
        # Attempt to send real email when configured
        if email_service.is_email_delivery_configured():
            try:
                email_service.send_password_reset_email(user.email, dev_token)
                dev_token = None
            except Exception:
                # swallow and keep dev_token for debugging
                pass

        db.add(AuditLog(tenant_id=user.tenant_id, user_id=user.id, action="PASSWORD_RESET_REQUESTED", details="Password reset requested", ip_address="127.0.0.1"))
        db.commit()

    return schemas.AuthActionResponse(
        message="If the account exists, a password reset link has been sent.",
        email=request.email,
        expires_in=RESET_TOKEN_EXPIRES_MINUTES * 60 if dev_token else None,
        dev_token=dev_token,
    )


@router.post("/reset-password", response_model=schemas.AuthActionResponse)
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets a password using a valid reset token."""
    user = load_user_by_token(db, "reset_token_hash", request.token)
    if not user or not user.reset_token_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token is invalid")
    if user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")

    user.password_hash = hash_password(request.new_password)
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    db.add(AuditLog(tenant_id=user.tenant_id, user_id=user.id, action="PASSWORD_RESET", details="Password reset completed", ip_address="127.0.0.1"))
    db.commit()

    return schemas.AuthActionResponse(
        message="Password updated successfully.",
        email=user.email,
        user_id=user.id,
        tenant_id=user.tenant_id,
    )


@router.post("/magic-link/request", response_model=schemas.AuthActionResponse)
def request_magic_link(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Creates a passwordless login token for a verified local account."""
    user = db.query(User).filter(User.email == request.email, User.auth_provider == "local").first()
    dev_token = None

    if user:
        dev_token = create_and_store_token(
            user,
            "magic_link_token_hash",
            "magic_link_token_expires_at",
            MAGIC_LINK_TOKEN_EXPIRES_MINUTES,
        )
        # Send magic link via email when configured
        if email_service.is_email_delivery_configured():
            try:
                email_service.send_magic_link_email(user.email, dev_token)
                dev_token = None
            except Exception:
                pass

        db.add(AuditLog(tenant_id=user.tenant_id, user_id=user.id, action="MAGIC_LINK_REQUESTED", details="Magic link requested", ip_address="127.0.0.1"))
        db.commit()

    return schemas.AuthActionResponse(
        message="If the account exists, a magic link has been sent.",
        email=request.email,
        expires_in=MAGIC_LINK_TOKEN_EXPIRES_MINUTES * 60 if dev_token else None,
        dev_token=dev_token,
    )


@router.post("/magic-link/verify", response_model=schemas.Token)
def verify_magic_link(request: schemas.TokenRequest, req_meta: Request, db: Session = Depends(get_db)):
    """Consumes a magic link token and returns an access token."""
    user = load_user_by_token(db, "magic_link_token_hash", request.token)
    if not user or not user.magic_link_token_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Magic link token is invalid")
    if user.magic_link_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Magic link token has expired")

    user.magic_link_token_hash = None
    user.magic_link_token_expires_at = None
    if not user.email_verified_at:
        user.email_verified_at = datetime.utcnow()

    token_data = build_user_payload(user)
    expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str, expires_in = create_access_token(data=token_data, expires_delta=expires_delta)

    refresh_token, refresh_expires_in = create_refresh_token_record(db, user)
    db.add(AuditLog(tenant_id=user.tenant_id, user_id=user.id, action="MAGIC_LINK_LOGIN", details="Magic link login successful", ip_address=req_meta.client.host if req_meta and req_meta.client else "127.0.0.1"))
    db.commit()

    return schemas.Token(access_token=token_str, token_type="bearer", expires_in=expires_in, refresh_token=refresh_token, refresh_expires_in=refresh_expires_in)


def get_email_domain(email: str) -> str:
    """Helper to extract domain from email."""
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address format")
    return email.split("@")[1].strip().lower()

@router.post("/sso/check", response_model=schemas.SSOCheckResponse)
def check_sso_domain(request: schemas.SSOCheckRequest, db: Session = Depends(get_db)):
    """Verifies if the organization's email domain is configured for corporate SSO (FR-AUTH-01)."""
    domain = get_email_domain(request.email)
    tenant = db.query(Tenant).filter(Tenant.sso_domain == domain).first()
    
    if tenant:
        return schemas.SSOCheckResponse(
            sso_enabled=True,
            sso_domain=tenant.sso_domain,
            company_name=tenant.company_name
        )
    return schemas.SSOCheckResponse(sso_enabled=False)

@router.post("/sso/login", response_model=schemas.Token)
def login_sso(
    request: schemas.SSOLoginRequest,
    req_meta: Request,
    db: Session = Depends(get_db)
):
    """
    Performs Just-In-Time (JIT) provisioning SAML 2.0 / OIDC login (FR-AUTH-01, FR-AUTH-03).
    Automatically maps user to their tenant workspace.
    """
    domain = get_email_domain(request.email)
    tenant = db.query(Tenant).filter(Tenant.sso_domain == domain).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This domain is not enrolled in SSO. Please contact your Tenant Administrator."
        )

    # Simulate SAML assertion validation
    # If SSO is validated, we fetch or provision the user (Just-in-time provisioning)
    user = db.query(User).filter(User.email == request.email, User.tenant_id == tenant.id).first()
    
    is_new_user = False
    if not user:
        # Provision new employee
        user = User(
            tenant_id=tenant.id,
            email=request.email,
            full_name=request.email.split("@")[0].replace(".", " ").title(),
            role="learner", # Default JIT provisioning starts as learner
            auth_provider="sso",
            email_verified_at=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new_user = True

    # Generate JWT token with 12 hour expiry (FR-AUTH-03)
    token_data = {
        "user_id": user.id,
        "tenant_id": user.tenant_id,
        "email": user.email,
        "role": user.role
    }
    expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str, expires_in = create_access_token(data=token_data, expires_delta=expires_delta)

    # Create refresh token for SSO session
    refresh_token, refresh_expires_in = create_refresh_token_record(db, user)

    # Log Auth event in Audit trail (FR-AUTH-05)
    audit = AuditLog(
        tenant_id=tenant.id,
        user_id=user.id,
        action="SSO_LOGIN",
        details=f"SSO login successful. User JIT provisioned: {is_new_user}",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()

    return schemas.Token(
        access_token=token_str,
        token_type="bearer",
        expires_in=expires_in,
        refresh_token=refresh_token,
        refresh_expires_in=refresh_expires_in,
    )


@router.post("/token/refresh", response_model=schemas.Token)
def refresh_access_token(request: schemas.RefreshTokenRequest, req_meta: Request, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access token (and rotate refresh token)."""
    refresh = resolve_refresh_token(db, request.refresh_token)
    if not refresh or refresh.expires_at < datetime.utcnow() or refresh.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is invalid or expired")

    user = db.query(User).filter(User.id == refresh.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found for refresh token")

    # Rotate refresh token: revoke old and issue new
    refresh.revoked_at = datetime.utcnow()
    new_token, new_expires_in = create_refresh_token_record(db, user)
    refresh.replaced_by_token_hash = hash_secure_token(new_token)
    db.add(AuditLog(tenant_id=user.tenant_id, user_id=user.id, action="REFRESH_ROTATE", details="Refresh token rotated", ip_address=req_meta.client.host if req_meta and req_meta.client else "127.0.0.1"))
    db.commit()

    token_data = build_user_payload(user)
    expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str, expires_in = create_access_token(data=token_data, expires_delta=expires_delta)

    return schemas.Token(access_token=token_str, token_type="bearer", expires_in=expires_in, refresh_token=new_token, refresh_expires_in=new_expires_in)


# --- Test Utility Helper Endpoint ---
@router.post("/seed-sandbox", response_model=Dict[str, Any], tags=["Sandbox Development Utilities"])
def seed_sandbox_data(db: Session = Depends(get_db)):
    """Seeds Acme Corporation tenant workspace and roles for testing purposes."""
    # Check if Acme already exists
    acme_tenant = db.query(Tenant).filter(Tenant.sso_domain == "acme.com").first()
    if not acme_tenant:
        acme_tenant = Tenant(
            company_name="Acme Corporation",
            sso_domain="acme.com"
        )
        db.add(acme_tenant)
        db.commit()
        db.refresh(acme_tenant)

    # Add users with different roles for testing RBAC
    roles_to_seed = [
        {"email": "admin@acme.com", "name": "Alice Admin", "role": "tenant_admin"},
        {"email": "trainer@acme.com", "name": "Ted Trainer", "role": "trainer"},
        {"email": "learner@acme.com", "name": "Leon Learner", "role": "learner"},
    ]
    
    seeded_users = []
    for u_seed in roles_to_seed:
        user = db.query(User).filter(User.email == u_seed["email"], User.tenant_id == acme_tenant.id).first()
        if not user:
            user = User(
                tenant_id=acme_tenant.id,
                email=u_seed["email"],
                full_name=u_seed["name"],
                role=u_seed["role"],
                auth_provider="sso",
                email_verified_at=datetime.utcnow(),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        seeded_users.append({
            "email": user.email,
            "role": user.role,
            "id": user.id
        })
        
    return {
        "message": "Acme Sandbox environment seeded successfully.",
        "tenant": {
            "id": acme_tenant.id,
            "company_name": acme_tenant.company_name,
            "sso_domain": acme_tenant.sso_domain
        },
        "users": seeded_users
    }
