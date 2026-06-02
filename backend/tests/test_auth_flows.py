import io
from fastapi.testclient import TestClient

import os
import sys
# Ensure backend/ is on sys.path when tests run so local modules import correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import Base, engine
from main import app


client = TestClient(app, base_url="http://testserver")


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def run_auth_flow():
    email = "new.user@example.com"
    password = "StrongPass123!"

    register_resp = client.post(
        "/api/auth/register",
        json={
            "full_name": "New User",
            "email": email,
            "password": password,
            "role": "student",
            "company_name": "Example Workspace",
        },
    )
    assert register_resp.status_code == 200
    register_data = register_resp.json()
    assert register_data["requires_email_verification"] is True
    assert register_data["dev_token"]

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


def test_role_based_access_and_session_payload():
    reset_db()

    seed_resp = client.post("/api/auth/seed-sandbox")
    assert seed_resp.status_code == 200
    seed_data = seed_resp.json()

    trainer_user = next(user for user in seed_data["users"] if user["role"] == "trainer")
    learner_user = next(user for user in seed_data["users"] if user["role"] == "learner")
    admin_user = next(user for user in seed_data["users"] if user["role"] == "tenant_admin")

    trainer_token = client.post("/api/auth/sso/login", json={"email": trainer_user["email"]}).json()["access_token"]
    learner_token = client.post("/api/auth/sso/login", json={"email": learner_user["email"]}).json()["access_token"]
    admin_token = client.post("/api/auth/sso/login", json={"email": admin_user["email"]}).json()["access_token"]

    trainer_headers = {"Authorization": f"Bearer {trainer_token}"}
    learner_headers = {"Authorization": f"Bearer {learner_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    trainer_session = client.get("/api/auth/session", headers=trainer_headers)
    assert trainer_session.status_code == 200
    assert trainer_session.json()["can_manage_users"] is False
    assert "trainer-analytics" in trainer_session.json()["accessible_route_groups"]

    learner_session = client.get("/api/auth/session", headers=learner_headers)
    assert learner_session.status_code == 200
    assert learner_session.json()["can_manage_users"] is False
    assert "admin" not in learner_session.json()["accessible_route_groups"]

    admin_session = client.get("/api/auth/session", headers=admin_headers)
    assert admin_session.status_code == 200
    assert admin_session.json()["can_manage_users"] is True
    assert admin_session.json()["can_view_admin_analytics"] is False

    learner_file_payload = {"file": ("blocked.pdf", io.BytesIO(b"blocked"), "application/pdf")}
    assert client.post("/api/files/upload", files=learner_file_payload, headers=learner_headers).status_code == 403
    assert client.post("/api/exams/generate", headers=learner_headers, json={"file_id": "file-1", "num_questions": 5}).status_code == 403
    assert client.get("/api/analytics/usage", headers=learner_headers).status_code == 403
    assert client.get("/api/analytics/usage", headers=trainer_headers).status_code == 403
    assert client.get("/api/analytics/usage", headers=admin_headers).status_code == 403

    print("native auth flow passed")


if __name__ == "__main__":
    reset_db()
    run_auth_flow()


# Ensure DB reset when running under pytest/import
reset_db()
