from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import routers.auth as auth
import routers.files as files
import routers.recap as recap
import routers.exams as exams
import routers.chat as chat
import routers.analytics as analytics

# Automatically create database tables on app launch (Development convenience)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Enterprise AI Knowledge & Upskilling Platform API",
    description="Multi-tenant B2B SaaS Backend with SAML SSO, Async Ingestion, RAG, and Skill-Gap analytics.",
    version="2.0.0"
)

# Configure CORS for integration with corporate frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to enterprise portal origins
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
