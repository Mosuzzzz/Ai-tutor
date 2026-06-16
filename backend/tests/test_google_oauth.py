import os
import sys

# Ensure backend/ is on sys.path when tests run so local modules import correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient

from config import settings
from database import Base, engine, SessionLocal
from models import User
import routers.public.auth as auth_router
from main import app

client = TestClient(app, base_url="http://testserver")

REDIRECT_URI = "http://localhost:3000/api/auth/google/callback"


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _stub_profile(monkeypatch, profile: dict):
    monkeypatch.setattr(auth_router, "fetch_google_profile", lambda code, redirect_uri: profile)


def test_google_login_requires_configuration(monkeypatch):
    reset_db()
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "")

    resp = client.post("/api/auth/google", json={"code": "abc", "redirect_uri": REDIRECT_URI})
    assert resp.status_code == 503


def test_google_login_creates_and_reuses_user(monkeypatch):
    reset_db()
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    _stub_profile(monkeypatch, {
        "email": "Gmail.User@example.com",
        "email_verified": True,
        "name": "Gmail User",
    })

    # First sign-in provisions a new user.
    first = client.post("/api/auth/google", json={"code": "code-1", "redirect_uri": REDIRECT_URI})
    assert first.status_code == 200, first.text
    body = first.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"

    db = SessionLocal()
    user = db.query(User).filter(User.email == "gmail.user@example.com").first()
    assert user is not None
    assert user.role == "user"
    assert user.auth_provider == "google"
    assert user.email_verified_at is not None
    db.close()

    # The newly minted token resolves to that account.
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == "gmail.user@example.com"

    # Second sign-in reuses the same account (no duplicate).
    second = client.post("/api/auth/google", json={"code": "code-2", "redirect_uri": REDIRECT_URI})
    assert second.status_code == 200
    db = SessionLocal()
    assert db.query(User).filter(User.email == "gmail.user@example.com").count() == 1
    db.close()


def test_google_login_rejects_unverified_email(monkeypatch):
    reset_db()
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    _stub_profile(monkeypatch, {"email": "x@example.com", "email_verified": False, "name": "X"})

    resp = client.post("/api/auth/google", json={"code": "c", "redirect_uri": REDIRECT_URI})
    assert resp.status_code == 400


def test_google_start_redirects_to_google_and_sets_state(monkeypatch):
    reset_db()
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")

    resp = client.get("/api/auth/google/start", follow_redirects=False)
    assert resp.status_code == 302
    location = resp.headers["location"]
    assert location.startswith("https://accounts.google.com/o/oauth2/v2/auth")
    assert "client_id=test-client-id" in location
    assert "state=" in location
    assert auth_router.OAUTH_STATE_COOKIE in resp.cookies


def test_google_callback_sets_session_cookies_on_valid_state(monkeypatch):
    reset_db()
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setattr(settings, "OAUTH_SUCCESS_REDIRECT", "http://localhost:3000")
    _stub_profile(monkeypatch, {"email": "cb@example.com", "email_verified": True, "name": "CB"})

    state = "state-xyz"
    resp = client.get(
        "/api/auth/google/callback",
        params={"code": "code-1", "state": state},
        cookies={auth_router.OAUTH_STATE_COOKIE: state},
        follow_redirects=False,
    )
    assert resp.status_code == 302
    assert resp.headers["location"] == "http://localhost:3000/"
    assert auth_router.OAUTH_ACCESS_COOKIE in resp.cookies

    db = SessionLocal()
    assert db.query(User).filter(User.email == "cb@example.com").count() == 1
    db.close()


def test_google_callback_rejects_state_mismatch(monkeypatch):
    reset_db()
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setattr(settings, "OAUTH_SUCCESS_REDIRECT", "http://localhost:3000")

    resp = client.get(
        "/api/auth/google/callback",
        params={"code": "code-1", "state": "attacker"},
        cookies={auth_router.OAUTH_STATE_COOKIE: "real-state"},
        follow_redirects=False,
    )
    assert resp.status_code == 302
    assert "error=google_state" in resp.headers["location"]


# Reset DB when collected under pytest alongside the other suites.
reset_db()
