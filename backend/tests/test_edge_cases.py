"""Edge cases the integration flow doesn't cover: no auth, bad input, missing resources, deletion."""
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from starlette.testclient import TestClient

from database import Base, engine
from main import app

client = TestClient(app, base_url="http://testserver")


def setup_module():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _login(email: str = "edge@example.com") -> dict:
    register = client.post(
        "/api/auth/register",
        json={"full_name": "Edge User", "email": email, "password": "StrongPass123!"},
    )
    assert register.status_code == 200, register.text
    client.post("/api/auth/verify-email", json={"token": register.json()["dev_token"]})
    login = client.post("/api/auth/login", json={"email": email, "password": "StrongPass123!"})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_endpoints_require_auth():
    for method, url in [
        ("get", "/api/files/"),
        ("get", "/api/analytics/dashboard"),
        ("get", "/api/chat/history"),
        ("post", "/api/exams/generate"),
        ("get", "/api/auth/me"),
    ]:
        resp = getattr(client, method)(url)
        assert resp.status_code in (401, 403), f"{url} returned {resp.status_code}"


def test_login_rejects_wrong_password_and_unknown_user():
    _login("wrongpass@example.com")
    bad = client.post("/api/auth/login", json={"email": "wrongpass@example.com", "password": "nope"})
    assert bad.status_code == 401
    ghost = client.post("/api/auth/login", json={"email": "ghost@example.com", "password": "whatever"})
    assert ghost.status_code == 401


def test_upload_rejects_unsupported_extension():
    headers = _login("upload-ext@example.com")
    payload = {"file": ("malware.exe", io.BytesIO(b"MZ..."), "application/octet-stream")}
    resp = client.post("/api/files/upload", files=payload, headers=headers)
    assert resp.status_code == 400
    assert "Unsupported file format" in resp.json()["detail"]


def test_missing_resources_return_404():
    headers = _login("missing@example.com")
    fake_id = "00000000-0000-0000-0000-000000000000"
    assert client.get(f"/api/files/{fake_id}/detail", headers=headers).status_code == 404
    assert client.get(f"/api/files/{fake_id}/download", headers=headers).status_code == 404
    assert client.delete(f"/api/files/{fake_id}", headers=headers).status_code == 404
    assert client.get(f"/api/exams/{fake_id}", headers=headers).status_code == 404
    assert client.post(f"/api/recap/{fake_id}", json={"detail_level": "executive"}, headers=headers).status_code == 404
    assert (
        client.post("/api/exams/generate", json={"file_id": fake_id, "num_questions": 5}, headers=headers).status_code
        == 404
    )


def test_delete_file_removes_it_for_owner_only():
    owner = _login("deleter@example.com")
    intruder = _login("not-deleter@example.com")

    doc = "Fire drill: sound alarm, call 911, exit via East Stairwell.\n" * 5
    payload = {"file": ("sop.pdf", io.BytesIO(doc.encode()), "application/pdf")}
    file_id = client.post("/api/files/upload", files=payload, headers=owner).json()["id"]

    # Intruder cannot delete someone else's file.
    assert client.delete(f"/api/files/{file_id}", headers=intruder).status_code == 404

    assert client.delete(f"/api/files/{file_id}", headers=owner).status_code == 204
    assert client.get(f"/api/files/{file_id}/detail", headers=owner).status_code == 404
    # Delete is not idempotent-silent: second delete is 404.
    assert client.delete(f"/api/files/{file_id}", headers=owner).status_code == 404


def test_register_duplicate_email_rejected():
    _login("dupe@example.com")
    resp = client.post(
        "/api/auth/register",
        json={"full_name": "Dupe", "email": "dupe@example.com", "password": "StrongPass123!"},
    )
    assert resp.status_code == 409
