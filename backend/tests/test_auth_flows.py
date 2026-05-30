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
    access_token = login_resp.json()["access_token"]
    assert access_token

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

    print("native auth flow passed")


if __name__ == "__main__":
    reset_db()
    run_auth_flow()


# Ensure DB reset when running under pytest/import
reset_db()
