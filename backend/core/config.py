import os
from dotenv import load_dotenv

# Load .env file from the backend package root to avoid picking up unrelated parent configs
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
local_env = os.path.join(backend_root, ".env")
load_dotenv(dotenv_path=local_env)

class Config:
    # Default to the project's Docker Postgres. Override with env var if needed.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:mysecretpassword@localhost:5432/enterprise_platform",
    )
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "").strip()
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY must be set in the environment")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    # Google OAuth (consumer social login). Empty by default -> endpoint reports "not configured".
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    GOOGLE_TOKEN_URL: str = os.getenv("GOOGLE_TOKEN_URL", "https://oauth2.googleapis.com/token")
    GOOGLE_USERINFO_URL: str = os.getenv("GOOGLE_USERINFO_URL", "https://openidconnect.googleapis.com/v1/userinfo")
    GOOGLE_AUTHORIZE_URL: str = os.getenv("GOOGLE_AUTHORIZE_URL", "https://accounts.google.com/o/oauth2/v2/auth")
    # Public callback URL registered in Google console. Empty -> derived from the request base URL.
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "").strip()
    # Where the browser lands after a successful/failed Google sign-in.
    OAUTH_SUCCESS_REDIRECT: str = os.getenv("OAUTH_SUCCESS_REDIRECT", FRONTEND_URL.split(",")[0].strip() or "http://localhost:3000")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(backend_root, "uploads"))
    SMTP_HOST: str = os.getenv("SMTP_HOST", "").strip()
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "").strip()
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "").strip()
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").strip().lower() in {"1", "true", "yes", "on"}
    SMTP_USE_SSL: bool = os.getenv("SMTP_USE_SSL", "false").strip().lower() in {"1", "true", "yes", "on"}
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME or "no-reply@example.com").strip()
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "Ai Tutor").strip()

# Ensure upload directory exists
os.makedirs(Config.UPLOAD_DIR, exist_ok=True)

settings = Config()
