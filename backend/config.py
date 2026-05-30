import os
from dotenv import load_dotenv

# Load .env file strictly from the backend directory to avoid picking up unrelated parent configs
local_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=local_env)

class Config:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./enterprise_platform.db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "").strip()
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY must be set in the environment")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads"))

# Ensure upload directory exists
os.makedirs(Config.UPLOAD_DIR, exist_ok=True)

settings = Config()
