from datetime import datetime, timedelta
import base64
import hashlib
import hmac
import secrets
from typing import List, Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from core.config import settings
from core.database import get_db
from core.models import RefreshToken, User

security_scheme = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> tuple[str, int]:
    """Generates a JWT access token and returns (token_string, expires_in_seconds)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
        expires_in = int(expires_delta.total_seconds())
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_in = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt, expires_in

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes a JWT access token, returning the payload or None if invalid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2 with a per-password salt."""
    salt = secrets.token_bytes(16)
    iterations = 200_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against the PBKDF2 hash format produced by hash_password."""
    try:
        algorithm, iterations_str, salt_b64, digest_b64 = password_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False

        iterations = int(iterations_str)
        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected_digest = base64.b64decode(digest_b64.encode("ascii"))
        candidate_digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(candidate_digest, expected_digest)
    except Exception:
        return False


def generate_secure_token() -> str:
    """Generate a URL-safe token for email verification and link-based auth flows."""
    return secrets.token_urlsafe(32)


def hash_secure_token(token: str) -> str:
    """Store only a one-way hash of sensitive email verification/reset tokens."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_refresh_token_record(db: Session, user: User) -> tuple[str, int]:
    """Create and persist a long-lived refresh token for a user session."""
    token = generate_secure_token()
    expires_at = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_secure_token(token),
        expires_at=expires_at,
    )
    db.add(refresh_record)
    # Do not commit here; caller should commit within the same transaction
    return token, int((expires_at - datetime.utcnow()).total_seconds())


def resolve_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    token_hash = hash_secure_token(token)
    return db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
 ) -> User:
    """Dependency to retrieve the authenticated user from JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("user_id")
    email: str = payload.get("email")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Update last active timestamp
    user.last_active_at = datetime.utcnow()
    db.commit()
    
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action forbidden for user role. Required: {self.allowed_roles}",
            )
        return user

def require_role(roles: List[str]):
    """Helper dependency to require specific role(s) for a route."""
    return RoleChecker(roles)
