from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, cast
from slowapi import Limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from database import engine, Base
from config import settings
import routers.public.auth as auth
import routers.public.files as files
import routers.public.recap as recap
import routers.tenant.exams as exams
import routers.public.chat as chat
import routers.admin.analytics as analytics

# Automatically create database tables on app launch (Development convenience)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Enterprise AI Knowledge & Upskilling Platform API",
    description="Multi-tenant B2B SaaS Backend with SAML SSO, Async Ingestion, RAG, and Skill-Gap analytics.",
    version="2.0.0"
)

__all__ = ["app"]

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"], storage_uri="memory://")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, cast(Any, _rate_limit_exceeded_handler))
app.add_middleware(SlowAPIMiddleware)

# Configure CORS for integration with corporate frontends
allowed_origins = [origin.strip() for origin in settings.FRONTEND_URL.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Sub-Routers
app.include_router(auth.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(recap.router, prefix="/api")
app.include_router(exams.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/")
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "Enterprise AI Knowledge Platform Backend",
        "timestamp": Base.metadata.schema or "standard-schema"
    }

# Also support importing / index.py in root or executing it directly as fallback
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
