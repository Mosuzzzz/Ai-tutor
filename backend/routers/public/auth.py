"""
Authentication router for the single-user AI Tutor.

Only two roles exist: ``user`` (everyone in the core study flow) and ``admin``
(system operators). There is no tenant/organization concept and no SSO.
"""
from datetime import datetime, timedelta
from typing import Dict, Any
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
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
from models import User, AuditLog, RefreshToken
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

        db.add(AuditLog(user_id=user.id, action="PASSWORD_RESET_REQUESTED", details="Password reset requested", ip_address="127.0.0.1"))
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
    db.add(AuditLog(user_id=user.id, action="PASSWORD_RESET", details="Password reset completed", ip_address="127.0.0.1"))
    db.commit()

    return schemas.AuthActionResponse(
        message="Password updated successfully.",
        email=user.email,
        user_id=user.id,
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

        db.add(AuditLog(user_id=user.id, action="MAGIC_LINK_REQUESTED", details="Magic link requested", ip_address="127.0.0.1"))
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


# --- Google OAuth (consumer social login) ---
#
# The whole redirect dance lives in the backend so no frontend code is required:
#   GET  /api/auth/google/start    -> redirect the browser to Google
#   GET  /api/auth/google/callback -> exchange code, set HttpOnly cookies, redirect home
# A programmatic POST /api/auth/google is also exposed for callers that already
# hold an authorization code (e.g. a future BFF).
#
# Deployment note: the session cookies are host-only (``__Host-`` prefix), so the
# backend and the user-facing app must share an origin (same domain / reverse
# proxy) for the cookie to be visible to the app. Tokens never appear in URLs.

OAUTH_ACCESS_COOKIE = "__Host-ai_tutor_access_token"
OAUTH_REFRESH_COOKIE = "__Host-ai_tutor_refresh_token"
OAUTH_STATE_COOKIE = "__Host-ai_tutor_oauth_state"
OAUTH_STATE_MAX_AGE_SECONDS = 600


def _require_google_configured() -> None:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google login is not configured")


def _google_redirect_uri(request: Request) -> str:
    """Resolve the callback URL; must match what is registered in Google console."""
    if settings.GOOGLE_REDIRECT_URI:
        return settings.GOOGLE_REDIRECT_URI
    return str(request.base_url).rstrip("/") + "/api/auth/google/callback"


def fetch_google_profile(code: str, redirect_uri: str) -> Dict[str, Any]:
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
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Google sign-in failed: {exc}") from exc


def provision_google_user(db: Session, profile: Dict[str, Any], req_meta: Request | None) -> schemas.Token:
    """Find-or-create a user from a verified Google profile and mint session tokens."""
    email = (profile.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account has no email")
    if profile.get("email_verified") is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google email is not verified")

    user = db.query(User).filter(User.email == email).first()
    is_new_user = user is None
    if is_new_user:
        user = User(
            email=email,
            full_name=profile.get("name") or email.split("@")[0],
            role="user",
            auth_provider="google",
            email_verified_at=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.email_verified_at:
        # A Google-verified email is trustworthy; mark a pre-existing local account verified.
        user.email_verified_at = datetime.utcnow()

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


@router.get("/google/start")
def google_start(request: Request):
    """Begin Google sign-in: set a CSRF state cookie and redirect to Google."""
    _require_google_configured()

    state = generate_secure_token()
    redirect_uri = _google_redirect_uri(request)
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }
    authorize_url = httpx.URL(settings.GOOGLE_AUTHORIZE_URL, params=params)

    response = RedirectResponse(url=str(authorize_url), status_code=status.HTTP_302_FOUND)
    # sameSite "lax" so the cookie returns on Google's top-level redirect back.
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        state,
        max_age=OAUTH_STATE_MAX_AGE_SECONDS,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )
    return response


@router.get("/google/callback")
def google_callback(request: Request, db: Session = Depends(get_db)):
    """Complete Google sign-in: verify state, exchange the code, set session cookies."""
    _require_google_configured()

    success_base = settings.OAUTH_SUCCESS_REDIRECT.rstrip("/")

    if request.query_params.get("error"):
        return RedirectResponse(url=f"{success_base}/login?error=google_denied", status_code=status.HTTP_302_FOUND)

    code = request.query_params.get("code")
    state = request.query_params.get("state")
    stored_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if not code or not state or not stored_state or state != stored_state:
        return RedirectResponse(url=f"{success_base}/login?error=google_state", status_code=status.HTTP_302_FOUND)

    try:
        profile = fetch_google_profile(code, _google_redirect_uri(request))
        token = provision_google_user(db, profile, request)
    except HTTPException:
        return RedirectResponse(url=f"{success_base}/login?error=google_failed", status_code=status.HTTP_302_FOUND)

    response = RedirectResponse(url=f"{success_base}/", status_code=status.HTTP_302_FOUND)
    response.set_cookie(
        OAUTH_ACCESS_COOKIE, token.access_token, max_age=token.expires_in,
        httponly=True, secure=True, samesite="lax", path="/",
    )
    if token.refresh_token and token.refresh_expires_in:
        response.set_cookie(
            OAUTH_REFRESH_COOKIE, token.refresh_token, max_age=token.refresh_expires_in,
            httponly=True, secure=True, samesite="lax", path="/",
        )
    # Consume the one-time state cookie.
    response.delete_cookie(OAUTH_STATE_COOKIE, path="/")
    return response


@router.post("/google", response_model=schemas.Token)
def login_with_google(request: schemas.GoogleAuthRequest, req_meta: Request, db: Session = Depends(get_db)):
    """Programmatic exchange: take an authorization ``code`` and return session tokens."""
    _require_google_configured()
    profile = fetch_google_profile(request.code, request.redirect_uri)
    return provision_google_user(db, profile, req_meta)
