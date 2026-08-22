import os
import sys
from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient

from config import settings
from database import Base, engine, SessionLocal
from models import OAuthAuthorization, OAuthIdentity, User
import routers.public.auth as auth_router
from main import app


client = TestClient(app, base_url="http://testserver")
BFF_HEADERS = {auth_router.BFF_AUTH_HEADER: "test-bff-secret"}
REDIRECT_URI = "http://localhost:3000/api/auth/google/callback"


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def configure_google(monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setattr(settings, "GOOGLE_AUTHORIZE_URL", auth_router.GOOGLE_AUTHORIZE_ENDPOINT)
    monkeypatch.setattr(settings, "GOOGLE_TOKEN_URL", auth_router.GOOGLE_TOKEN_ENDPOINT)
    monkeypatch.setattr(settings, "GOOGLE_USERINFO_URL", auth_router.GOOGLE_USERINFO_ENDPOINT)
    monkeypatch.setattr(settings, "GOOGLE_ISSUER", auth_router.GOOGLE_ISSUER)
    monkeypatch.setattr(settings, "GOOGLE_REDIRECT_URI", REDIRECT_URI)
    monkeypatch.setattr(settings, "FRONTEND_URL", "http://localhost:3000")
    monkeypatch.setattr(settings, "OAUTH_SUCCESS_REDIRECT", "http://localhost:3000")
    monkeypatch.setattr(settings, "BFF_SHARED_SECRET", "test-bff-secret")


def start_oauth():
    response = client.post("/api/auth/google/start", headers=BFF_HEADERS)
    assert response.status_code == 200, response.text
    return response.json()


def callback(started, **overrides):
    payload = {
        "code": "google-code",
        "state": started["state"],
        "oauth_state": started["state"],
    }
    payload.update(overrides)
    return client.post("/api/auth/google/callback", headers=BFF_HEADERS, json=payload)


def profile(**overrides):
    value = {
        "iss": auth_router.GOOGLE_ISSUER,
        "sub": "google-subject-1",
        "email": "google.user@example.com",
        "email_verified": True,
        "name": "Google User",
    }
    value.update(overrides)
    return value


def test_google_exchange_is_bff_only_and_legacy_public_exchange_is_removed(monkeypatch):
    reset_db()
    configure_google(monkeypatch)

    assert client.post("/api/auth/google/start").status_code == 401
    assert client.post("/api/auth/google/callback", json={}).status_code == 401
    assert client.post("/api/auth/google", json={"code": "code", "redirect_uri": REDIRECT_URI}).status_code in {404, 405}


def test_google_start_uses_backend_state_pkce_and_strict_allowlisted_redirect(monkeypatch):
    reset_db()
    configure_google(monkeypatch)

    started = start_oauth()
    query = parse_qs(urlparse(started["authorization_url"]).query)

    assert started["state"] == query["state"][0]
    assert query["redirect_uri"] == [REDIRECT_URI]
    assert query["code_challenge_method"] == ["S256"]
    assert query["code_challenge"][0]
    assert "access_type" not in query

    db = SessionLocal()
    transaction = db.query(OAuthAuthorization).one()
    assert transaction.state_hash != started["state"]
    assert transaction.code_verifier not in started["authorization_url"]
    db.close()


def test_google_configuration_rejects_non_allowlisted_provider_endpoint(monkeypatch):
    reset_db()
    configure_google(monkeypatch)
    monkeypatch.setattr(settings, "GOOGLE_TOKEN_URL", "https://evil.example/token")

    response = client.post("/api/auth/google/start", headers=BFF_HEADERS)
    assert response.status_code == 503
    assert response.json()["detail"] == "Google login configuration is not allowed"


def test_google_callback_persists_issuer_subject_and_returns_bff_session(monkeypatch):
    reset_db()
    configure_google(monkeypatch)
    seen = {}

    def fetch(code, redirect_uri, code_verifier):
        seen.update(code=code, redirect_uri=redirect_uri, code_verifier=code_verifier)
        return profile()

    monkeypatch.setattr(auth_router, "fetch_google_profile", fetch)
    started = start_oauth()
    response = callback(started)

    assert response.status_code == 200
    result = response.json()
    assert result["ok"] is True
    assert result["classification"] == "success"
    assert result["session"]["access_token"]
    assert seen["redirect_uri"] == REDIRECT_URI
    assert seen["code_verifier"]

    db = SessionLocal()
    identity = db.query(OAuthIdentity).one()
    assert identity.issuer == auth_router.GOOGLE_ISSUER
    assert identity.subject == "google-subject-1"
    assert identity.user.auth_provider == "google"
    assert db.query(OAuthAuthorization).count() == 0
    db.close()

    session = client.get(
        "/api/auth/session",
        headers={"Authorization": f"Bearer {result['session']['access_token']}"},
    )
    assert session.status_code == 200


def test_google_requires_email_verified_to_be_exactly_true(monkeypatch):
    reset_db()
    configure_google(monkeypatch)

    for invalid_value in (False, None, "true"):
        monkeypatch.setattr(
            auth_router,
            "fetch_google_profile",
            lambda code, redirect_uri, verifier, value=invalid_value: profile(email_verified=value),
        )
        result = callback(start_oauth()).json()
        assert result["classification"] == "identity_rejected"
        assert result["session"] is None


def test_google_does_not_link_existing_password_or_admin_account_by_email(monkeypatch):
    reset_db()
    configure_google(monkeypatch)
    db = SessionLocal()
    db.add(User(
        email="google.user@example.com",
        full_name="Existing Admin",
        role="admin",
        auth_provider="local",
        password_hash="existing-hash",
        email_verified_at=datetime.utcnow(),
    ))
    db.commit()
    db.close()
    monkeypatch.setattr(auth_router, "fetch_google_profile", lambda code, redirect_uri, verifier: profile())

    result = callback(start_oauth()).json()
    assert result["classification"] == "account_conflict"
    assert result["session"] is None

    db = SessionLocal()
    assert db.query(User).count() == 1
    assert db.query(OAuthIdentity).count() == 0
    assert db.query(OAuthAuthorization).count() == 0
    db.close()


def test_google_state_is_consumed_on_denial_mismatch_and_timeout(monkeypatch):
    reset_db()
    configure_google(monkeypatch)

    denied = start_oauth()
    assert callback(denied, code=None, error="access_denied").json()["classification"] == "denied"

    mismatched = start_oauth()
    assert callback(mismatched, state="attacker-state").json()["classification"] == "invalid_state"

    expired = start_oauth()
    db = SessionLocal()
    transaction = db.query(OAuthAuthorization).one()
    transaction.expires_at = datetime.utcnow() - timedelta(seconds=1)
    db.commit()
    db.close()
    assert callback(expired).json()["classification"] == "expired_state"

    db = SessionLocal()
    assert db.query(OAuthAuthorization).count() == 0
    db.close()


def test_google_state_is_consumed_and_provider_details_are_hidden_on_failures(monkeypatch):
    reset_db()
    configure_google(monkeypatch)

    def provider_failure(code, redirect_uri, verifier):
        raise auth_router.OAuthProviderError("sensitive provider payload")

    monkeypatch.setattr(auth_router, "fetch_google_profile", provider_failure)
    provider_result = callback(start_oauth())
    assert provider_result.json()["classification"] == "provider_failure"
    assert "sensitive" not in provider_result.text

    monkeypatch.setattr(auth_router, "fetch_google_profile", lambda code, redirect_uri, verifier: profile())
    monkeypatch.setattr(auth_router, "provision_google_user", lambda db, value, request: (_ for _ in ()).throw(RuntimeError("database secret")))
    provisioning_result = callback(start_oauth())
    assert provisioning_result.json()["classification"] == "provisioning_failure"
    assert "database secret" not in provisioning_result.text

    db = SessionLocal()
    assert db.query(OAuthAuthorization).count() == 0
    db.close()


reset_db()
