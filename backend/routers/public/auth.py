"""
Authentication router for the single-user AI Tutor.

Only two roles exist: ``user`` (everyone in the core study flow) and ``admin``
(system operators). There is no tenant/organization concept and no SSO.
"""
from datetime import datetime, timedelta
from typing import Dict, Any
import base64
import hashlib
import secrets
from urllib.parse import urlparse
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from auth import (
    create_access_token,
    generate_secure_token,
    hash_password,
    hash_secure_token,
    get_current_user,
    verify_password,
    create_refresh_token_record,
    resolve_refresh_token,
)
from database import get_db
from models import User, AuditLog, RefreshToken, OAuthAuthorization, OAuthIdentity
import schemas

import services.email_service as email_service
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

VERIFICATION_TOKEN_EXPIRES_MINUTES = 60 * 24
RESET_TOKEN_EXPIRES_MINUTES = 60
MAGIC_LINK_TOKEN_EXPIRES_MINUTES = 15

# Route groups each role may reach. Kept intentionally small for a personal product.
USER_ROUTE_GROUPS = ["dashboard", "documents", "chat", "quiz", "analytics"]
ADMIN_ROUTE_GROUPS = USER_ROUTE_GROUPS + ["admin"]


def build_user_payload(user: User) -> Dict[str, Any]:
    return {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }


def serialize_user(user: User) -> schemas.UserResponse:
    return schemas.UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        created_at=user.created_at,
        last_active_at=user.last_active_at,
    )


def build_session_response(user: User) -> schemas.SessionResponse:
    is_admin = user.role == "admin"
    return schemas.SessionResponse(
        authenticated=True,
        user=serialize_user(user),
        accessible_route_groups=ADMIN_ROUTE_GROUPS if is_admin else USER_ROUTE_GROUPS,
        is_admin=is_admin,
    )


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
    """Self-service email/password registration. Every account is a ``user``."""
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = User(
        email=request.email,
        full_name=request.full_name,
        role="user",
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
    db.add(AuditLog(user_id=user.id, action="EMAIL_VERIFIED", details="Email verified", ip_address="127.0.0.1"))
    db.commit()

    return schemas.AuthActionResponse(
        message="Email verified successfully.",
        email=user.email,
        user_id=user.id,
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
    db.add(AuditLog(user_id=user.id, action="PASSWORD_LOGIN", details="Password login successful", ip_address=req_meta.client.host if req_meta and req_meta.client else "127.0.0.1"))
    db.commit()

    return schemas.Token(access_token=token_str, token_type="bearer", expires_in=expires_in, refresh_token=refresh_token, refresh_expires_in=refresh_expires_in)


@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user profile for session-aware clients."""
    return serialize_user(current_user)


@router.get("/session", response_model=schemas.SessionResponse)
def read_session(current_user: User = Depends(get_current_user)):
    """Returns the current authenticated session together with accessible route groups."""
    return build_session_response(current_user)


@router.post("/logout", response_model=schemas.AuthActionResponse)
def logout_current_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Revokes all active refresh tokens for the current user session."""
    active_tokens = db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked_at.is_(None),
    ).all()

    for token in active_tokens:
        token.revoked_at = datetime.utcnow()

    db.add(
        AuditLog(
            user_id=current_user.id,
            action="LOGOUT",
            details=f"User logged out; revoked {len(active_tokens)} refresh token(s).",
            ip_address="127.0.0.1",
        )
    )
    db.commit()

    return schemas.AuthActionResponse(message="Logged out successfully.")


@router.post("/forgot-password", response_model=schemas.RecoveryRequestResponse)
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generates a password reset token without revealing whether the email exists."""
    user = db.query(User).filter(User.email == request.email, User.auth_provider == "local").first()

    if user and user.email_verified_at:
        reset_token = create_and_store_token(
            user,
            "reset_token_hash",
            "reset_token_expires_at",
            RESET_TOKEN_EXPIRES_MINUTES,
        )
        # Attempt to send real email when configured
        if email_service.is_email_delivery_configured():
            try:
                email_service.send_password_reset_email(user.email, reset_token)
            except Exception:
                pass

        db.add(AuditLog(user_id=user.id, action="PASSWORD_RESET_REQUESTED", details="Password reset requested", ip_address="127.0.0.1"))
        db.commit()

    return schemas.RecoveryRequestResponse(
        message="If the account exists, a password reset link has been sent.",
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
    db.add(AuditLog(user_id=user.id, action="PASSWORD_RESET", details="Password reset completed", ip_address="127.0.0.1"))
    db.commit()

    return schemas.AuthActionResponse(
        message="Password updated successfully.",
        email=user.email,
        user_id=user.id,
    )


@router.post("/magic-link/request", response_model=schemas.RecoveryRequestResponse)
def request_magic_link(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Creates a passwordless login token for a verified local account."""
    user = db.query(User).filter(User.email == request.email, User.auth_provider == "local").first()

    if user:
        magic_token = create_and_store_token(
            user,
            "magic_link_token_hash",
            "magic_link_token_expires_at",
            MAGIC_LINK_TOKEN_EXPIRES_MINUTES,
        )
        # Send magic link via email when configured
        if email_service.is_email_delivery_configured():
            try:
                email_service.send_magic_link_email(user.email, magic_token)
            except Exception:
                pass

        db.add(AuditLog(user_id=user.id, action="MAGIC_LINK_REQUESTED", details="Magic link requested", ip_address="127.0.0.1"))
        db.commit()

    return schemas.RecoveryRequestResponse(
        message="If the account exists, a magic link has been sent.",
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
    db.add(AuditLog(user_id=user.id, action="MAGIC_LINK_LOGIN", details="Magic link login successful", ip_address=req_meta.client.host if req_meta and req_meta.client else "127.0.0.1"))
    db.commit()

    return schemas.Token(access_token=token_str, token_type="bearer", expires_in=expires_in, refresh_token=refresh_token, refresh_expires_in=refresh_expires_in)


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
    db.add(AuditLog(user_id=user.id, action="REFRESH_ROTATE", details="Refresh token rotated", ip_address=req_meta.client.host if req_meta and req_meta.client else "127.0.0.1"))
    db.commit()

    token_data = build_user_payload(user)
    expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str, expires_in = create_access_token(data=token_data, expires_delta=expires_delta)

    return schemas.Token(access_token=token_str, token_type="bearer", expires_in=expires_in, refresh_token=new_token, refresh_expires_in=new_expires_in)


# --- Google OAuth (BFF-only authorization-code flow) ---

OAUTH_STATE_MAX_AGE_SECONDS = 600
GOOGLE_AUTHORIZE_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_ISSUER = "https://accounts.google.com"
BFF_AUTH_HEADER = "x-ai-tutor-bff-key"


class OAuthProviderError(Exception):
    """Provider details must never cross the backend/BFF trust boundary."""


class OAuthIdentityError(Exception):
    pass


class OAuthAccountConflict(Exception):
    pass


def _require_google_configured() -> None:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET or not settings.GOOGLE_REDIRECT_URI:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google login is not configured")

    if not settings.BFF_SHARED_SECRET:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google login is not configured")

    configured_endpoints = (
        (settings.GOOGLE_AUTHORIZE_URL, GOOGLE_AUTHORIZE_ENDPOINT),
        (settings.GOOGLE_TOKEN_URL, GOOGLE_TOKEN_ENDPOINT),
        (settings.GOOGLE_USERINFO_URL, GOOGLE_USERINFO_ENDPOINT),
        (settings.GOOGLE_ISSUER, GOOGLE_ISSUER),
    )
    if any(configured != allowed for configured, allowed in configured_endpoints):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google login configuration is not allowed")

    redirect = _parse_origin_url(settings.GOOGLE_REDIRECT_URI)
    success = _parse_origin_url(settings.OAUTH_SUCCESS_REDIRECT)
    allowed_origins = {_origin(value) for value in settings.FRONTEND_URL.split(",") if value.strip()}
    if (
        redirect is None
        or redirect.path != "/api/auth/google/callback"
        or redirect.query
        or redirect.fragment
        or success is None
        or success.path not in ("", "/")
        or _origin(settings.GOOGLE_REDIRECT_URI) not in allowed_origins
        or _origin(settings.OAUTH_SUCCESS_REDIRECT) not in allowed_origins
    ):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google login configuration is not allowed")


def _require_bff(request: Request) -> None:
    if not settings.BFF_SHARED_SECRET:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="BFF authentication is not configured")
    provided = request.headers.get(BFF_AUTH_HEADER, "")
    if not provided or not secrets.compare_digest(provided, settings.BFF_SHARED_SECRET):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="BFF authentication required")


def _parse_origin_url(value: str):
    try:
        parsed = urlparse(value.strip())
    except ValueError:
        return None
    if parsed.scheme not in {"https", "http"} or not parsed.hostname or parsed.username or parsed.password:
        return None
    if parsed.scheme == "http" and parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
        return None
    return parsed


def _origin(value: str) -> str:
    parsed = _parse_origin_url(value)
    if parsed is None:
        return ""
    try:
        port = parsed.port
    except ValueError:
        return ""
    default_port = 443 if parsed.scheme == "https" else 80
    port_suffix = f":{port}" if port and port != default_port else ""
    return f"{parsed.scheme}://{parsed.hostname}{port_suffix}"


def fetch_google_profile(code: str, redirect_uri: str, code_verifier: str) -> Dict[str, Any]:
    """Exchange an authorization code for the Google account profile.

    Isolated so it can be stubbed in tests. Raises HTTPException on any failure.
    """
    try:
        with httpx.Client(timeout=10.0) as client:
            token_resp = client.post(
                settings.GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                    "code_verifier": code_verifier,
                },
            )
            token_resp.raise_for_status()
            access_token = token_resp.json().get("access_token")
            if not access_token:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google did not return an access token")

            userinfo_resp = client.get(
                settings.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            userinfo_resp.raise_for_status()
            return userinfo_resp.json()
    except Exception as exc:
        raise OAuthProviderError() from exc


def provision_google_user(db: Session, profile: Dict[str, Any], req_meta: Request | None) -> schemas.Token:
    """Find-or-create by issuer/subject only and mint tokens for the BFF."""
    email = (profile.get("email") or "").strip().lower()
    if not email:
        raise OAuthIdentityError()
    if profile.get("email_verified") is not True:
        raise OAuthIdentityError()

    issuer = profile.get("iss") or GOOGLE_ISSUER
    subject = profile.get("sub")
    if issuer != GOOGLE_ISSUER or not isinstance(subject, str) or not subject.strip():
        raise OAuthIdentityError()

    identity = db.query(OAuthIdentity).filter(
        OAuthIdentity.issuer == issuer,
        OAuthIdentity.subject == subject,
    ).first()
    is_new_user = identity is None
    if identity:
        user = identity.user
        identity.email = email
        identity.last_login_at = datetime.utcnow()
    else:
        # Email is not proof of account ownership. Never attach Google to an
        # existing password, admin, or legacy account implicitly.
        if db.query(User).filter(User.email == email).first():
            raise OAuthAccountConflict()
        user = User(
            email=email,
            full_name=profile.get("name") or email.split("@")[0],
            role="user",
            auth_provider="google",
            email_verified_at=datetime.utcnow(),
        )
        db.add(user)
        db.flush()
        db.add(OAuthIdentity(user_id=user.id, issuer=issuer, subject=subject, email=email))

    token_data = build_user_payload(user)
    expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str, expires_in = create_access_token(data=token_data, expires_delta=expires_delta)
    refresh_token, refresh_expires_in = create_refresh_token_record(db, user)

    db.add(AuditLog(
        user_id=user.id,
        action="GOOGLE_LOGIN",
        details=f"Google sign-in successful (new_user={is_new_user})",
        ip_address=req_meta.client.host if req_meta and req_meta.client else "127.0.0.1",
    ))
    db.commit()

    return schemas.Token(
        access_token=token_str,
        token_type="bearer",
        expires_in=expires_in,
        refresh_token=refresh_token,
        refresh_expires_in=refresh_expires_in,
    )


@router.post("/google/start", response_model=schemas.GoogleOAuthStartResponse)
def google_start(request: Request, response: Response, db: Session = Depends(get_db)):
    """Create a backend-owned one-time transaction for the trusted Next BFF."""
    _require_bff(request)
    _require_google_configured()
    response.headers["Cache-Control"] = "no-store"

    now = datetime.utcnow()
    db.query(OAuthAuthorization).filter(OAuthAuthorization.expires_at <= now).delete(synchronize_session=False)
    state = generate_secure_token()
    code_verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode("ascii")).digest()).decode("ascii").rstrip("=")
    db.add(OAuthAuthorization(
        state_hash=hash_secure_token(state),
        code_verifier=code_verifier,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        expires_at=now + timedelta(seconds=OAUTH_STATE_MAX_AGE_SECONDS),
    ))
    db.commit()
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "prompt": "select_account",
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    authorize_url = httpx.URL(settings.GOOGLE_AUTHORIZE_URL, params=params)
    return schemas.GoogleOAuthStartResponse(
        authorization_url=str(authorize_url),
        expires_in=OAUTH_STATE_MAX_AGE_SECONDS,
        state=state,
    )


def _oauth_result(classification: str, message: str, token: schemas.Token | None = None):
    return schemas.GoogleOAuthResult(
        ok=classification == "success",
        classification=classification,
        message=message,
        session=token,
    )


@router.post("/google/callback", response_model=schemas.GoogleOAuthResult)
def google_callback(
    payload: schemas.GoogleOAuthCallbackRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Consume state, validate Google identity, and return tokens only to the BFF."""
    _require_bff(request)
    response.headers["Cache-Control"] = "no-store"

    lookup_state = payload.oauth_state or payload.state
    transaction = None
    if lookup_state:
        transaction = db.query(OAuthAuthorization).filter(
            OAuthAuthorization.state_hash == hash_secure_token(lookup_state)
        ).first()

    # Delete before any provider/provisioning work. Every path after a recognized
    # transaction is terminal and cannot replay it, even if downstream work fails.
    if transaction:
        db.delete(transaction)
        db.commit()

    if not transaction or not payload.state or not payload.oauth_state:
        return _oauth_result("invalid_state", "OAuth state is invalid or has already been used")
    if not secrets.compare_digest(payload.state, payload.oauth_state):
        return _oauth_result("invalid_state", "OAuth state does not match")
    if transaction.expires_at <= datetime.utcnow():
        return _oauth_result("expired_state", "OAuth transaction has expired")
    if payload.error:
        return _oauth_result("denied", "Google authorization was denied")
    if not payload.code:
        return _oauth_result("provider_failure", "Google authorization did not return a code")

    try:
        _require_google_configured()
        profile = fetch_google_profile(payload.code, transaction.redirect_uri, transaction.code_verifier)
        token = provision_google_user(db, profile, request)
        return _oauth_result("success", "Google sign-in succeeded", token)
    except OAuthProviderError:
        db.rollback()
        return _oauth_result("provider_failure", "Google sign-in could not be completed")
    except HTTPException:
        db.rollback()
        return _oauth_result("provider_failure", "Google sign-in configuration is unavailable")
    except OAuthIdentityError:
        db.rollback()
        return _oauth_result("identity_rejected", "Google identity did not meet sign-in requirements")
    except OAuthAccountConflict:
        db.rollback()
        return _oauth_result("account_conflict", "An existing account requires explicit linking")
    except Exception:
        db.rollback()
        return _oauth_result("provisioning_failure", "The account session could not be created")
