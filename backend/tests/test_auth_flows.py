import io
from fastapi.testclient import TestClient

import os
import sys
# Ensure backend/ is on sys.path when tests run so local modules import correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import Base, engine, SessionLocal
from models import User
from main import app


client = TestClient(app, base_url="http://testserver")


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def register_and_login(email: str, password: str, full_name: str = "Test User") -> str:
    """Register, verify email, and log in. Returns the access token."""
    register_resp = client.post(
        "/api/auth/register",
        json={"full_name": full_name, "email": email, "password": password},
    )
    assert register_resp.status_code == 200, register_resp.text
    dev_token = register_resp.json()["dev_token"]
    assert dev_token

    verify_resp = client.post("/api/auth/verify-email", json={"token": dev_token})
    assert verify_resp.status_code == 200

    login_resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login_resp.status_code == 200
    return login_resp.json()["access_token"]


def run_auth_flow():
    email = "new.user@example.com"
    password = "StrongPass123!"

    register_resp = client.post(
        "/api/auth/register",
        json={"full_name": "New User", "email": email, "password": password},
    )
    assert register_resp.status_code == 200
    register_data = register_resp.json()
    assert register_data["requires_email_verification"] is True
    assert register_data["dev_token"]
    # No tenant concept in the single-user product.
    assert "tenant_id" not in register_data or register_data["tenant_id"] is None

    login_before_verify = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login_before_verify.status_code == 403

    verify_resp = client.post("/api/auth/verify-email", json={"token": register_data["dev_token"]})
    assert verify_resp.status_code == 200

    login_resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    access_token = login_data["access_token"]
    refresh_token = login_data["refresh_token"]
    assert access_token
    assert refresh_token

    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email
    assert me_resp.json()["role"] == "user"

    logout_resp = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {access_token}"})
    assert logout_resp.status_code == 200

    refresh_after_logout = client.post("/api/auth/token/refresh", json={"refresh_token": refresh_token})
    assert refresh_after_logout.status_code == 401

    forgot_resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert forgot_resp.status_code == 200
    reset_token = forgot_resp.json()["dev_token"]
    assert reset_token

    reset_resp = client.post(
        "/api/auth/reset-password",
        json={"token": reset_token, "new_password": "NewPass456!"},
    )
    assert reset_resp.status_code == 200

    magic_request_resp = client.post("/api/auth/magic-link/request", json={"email": email})
    assert magic_request_resp.status_code == 200
    magic_token = magic_request_resp.json()["dev_token"]
    assert magic_token

    magic_verify_resp = client.post("/api/auth/magic-link/verify", json={"token": magic_token})
    assert magic_verify_resp.status_code == 200
    assert magic_verify_resp.json()["access_token"]


def test_auth_flow():
    reset_db()
    run_auth_flow()


def test_two_role_access_and_session_payload():
    reset_db()

    user_token = register_and_login("regular@example.com", "StrongPass123!", "Regular User")
    admin_token = register_and_login("ops@example.com", "StrongPass123!", "Ops Admin")

    # Promote the second account to admin directly (no self-service admin signup).
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "ops@example.com").first()
    admin.role = "admin"
    db.commit()
    db.close()

    user_headers = {"Authorization": f"Bearer {user_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Session payload reflects the two-role model.
    user_session = client.get("/api/auth/session", headers=user_headers)
    assert user_session.status_code == 200
    assert user_session.json()["is_admin"] is False
    assert "admin" not in user_session.json()["accessible_route_groups"]

    admin_session = client.get("/api/auth/session", headers=admin_headers)
    assert admin_session.status_code == 200
    assert admin_session.json()["is_admin"] is True
    assert "admin" in admin_session.json()["accessible_route_groups"]

    # Admin-only analytics endpoints are gated.
    assert client.get("/api/analytics/usage", headers=user_headers).status_code == 403
    assert client.get("/api/analytics/audit-logs", headers=user_headers).status_code == 403
    assert client.get("/api/analytics/usage", headers=admin_headers).status_code == 200
    assert client.get("/api/analytics/audit-logs", headers=admin_headers).status_code == 200

    # Any user can upload to their own workspace (no trainer role required).
    user_file_payload = {"file": ("notes.pdf", io.BytesIO(b"%PDF-1.4 minimal"), "application/pdf")}
    upload = client.post("/api/files/upload", files=user_file_payload, headers=user_headers)
    assert upload.status_code == 201

    # The personal dashboard is reachable by a regular user.
    assert client.get("/api/analytics/dashboard", headers=user_headers).status_code == 200


if __name__ == "__main__":
    reset_db()
    run_auth_flow()


# Ensure DB reset when running under pytest/import
reset_db()
