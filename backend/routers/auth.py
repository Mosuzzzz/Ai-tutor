from datetime import timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Tenant, User, AuditLog
import schemas
from auth import create_access_token
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & SSO"])

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
            role="learner" # Default JIT provisioning starts as learner
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
        expires_in=expires_in
    )

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
                role=u_seed["role"]
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
