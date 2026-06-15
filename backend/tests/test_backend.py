import io
from starlette.testclient import TestClient
import os
import sys
# Ensure backend/ is on sys.path when tests run so local modules import correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from database import engine, Base, SessionLocal
from models import User, Exam

client = TestClient(app, base_url="http://testserver")


def setup_test_db():
    # Drop and recreate tables for clean test slate
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


# Ensure a clean DB for test runs
setup_test_db()


def print_banner(msg: str):
    print("=" * 60)
    print(f" {msg.upper()}")
    print("=" * 60)


def _register_and_login(email: str, password: str = "StrongPass123!", full_name: str = "Study User") -> str:
    register = client.post(
        "/api/auth/register",
        json={"full_name": full_name, "email": email, "password": password},
    )
    assert register.status_code == 200, register.text
    dev_token = register.json()["dev_token"]
    assert client.post("/api/auth/verify-email", json={"token": dev_token}).status_code == 200
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return login.json()["access_token"]


def test_integration_flow():
    setup_test_db()

    print_banner("1. Register & log in a personal study user")
    token = _register_and_login("owner@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # A second, unrelated user — used to prove personal isolation.
    other_token = _register_and_login("intruder@example.com", full_name="Other User")
    other_headers = {"Authorization": f"Bearer {other_token}"}

    print_banner("2. Upload a document & run the ingestion pipeline")
    pdf_content = (
        "ACME FIRE SAFETY EMERGENCY STANDARD OPERATING PROCEDURE\n"
        "1. In the event of a fire, employees must immediately sound the alarm.\n"
        "2. Call the emergency line at 911 within 3 minutes of discovering smoke.\n"
        "3. Evacuate via the East Stairwell to Assembly Point Delta.\n"
        "4. Do not use elevators during fire evacuation.\n"
        "Glossary: SOP stands for Standard Operating Procedure.\n"
    )
    file_payload = {"file": ("fire_safety_manual.pdf", io.BytesIO(pdf_content.encode("utf-8")), "application/pdf")}
    upload_resp = client.post("/api/files/upload", files=file_payload, headers=headers)
    assert upload_resp.status_code == 201
    file_id = upload_resp.json()["id"]

    # Personal isolation: the other user cannot see or download this document.
    assert client.get(f"/api/files/{file_id}/download", headers=other_headers).status_code == 404
    assert client.get(f"/api/files/{file_id}/detail", headers=other_headers).status_code == 404

    # Background tasks run synchronously at request completion in the TestClient.
    files_list = client.get("/api/files/", headers=headers)
    assert files_list.status_code == 200
    file_entry = next(f for f in files_list.json() if f["id"] == file_id)
    assert file_entry["status"] == "ready"

    documents_dashboard = client.get("/api/files/dashboard", headers=headers)
    assert documents_dashboard.status_code == 200
    documents_data = documents_dashboard.json()
    assert documents_data["total_documents"] >= 1
    assert documents_data["status_counts"]["ready"] >= 1
    assert documents_data["documents"][0]["filename"] == "fire_safety_manual.pdf"
    assert documents_data["documents"][0]["summary_available"] is True

    document_detail = client.get(f"/api/files/{file_id}/detail", headers=headers)
    assert document_detail.status_code == 200
    assert document_detail.json()["summary_available"] is True
    assert "Overview" in document_detail.json()["summary_markdown"]

    print_banner("3. AI recap (summary)")
    recap_exec = client.post(f"/api/recap/{file_id}", json={"detail_level": "executive"}, headers=headers)
    assert recap_exec.status_code == 200
    recap_detail = client.post(f"/api/recap/{file_id}", json={"detail_level": "detailed"}, headers=headers)
    assert recap_detail.status_code == 200
    assert "Overview" in recap_detail.json()["summary_markdown"]

    print_banner("4. Personal review quiz: generate -> take -> submit")
    quiz_resp = client.post("/api/exams/generate", json={"file_id": file_id, "num_questions": 5}, headers=headers)
    assert quiz_resp.status_code == 200
    exam_id = quiz_resp.json()["id"]
    # Answer key is hidden before submission.
    assert "correct_index" not in quiz_resp.json()["questions"][0]

    # The other user cannot read someone else's quiz.
    assert client.get(f"/api/exams/{exam_id}", headers=other_headers).status_code == 404

    # Owner sees the quiz, still with answers hidden until they submit.
    owner_view = client.get(f"/api/exams/{exam_id}", headers=headers)
    assert owner_view.status_code == 200
    assert "correct_index" not in owner_view.json()["questions"][0]

    # The answer key is never exposed via the API before submission, so read it
    # from the database to construct a perfect-score submission.
    db = SessionLocal()
    stored_questions = db.query(Exam).filter(Exam.id == exam_id).first().questions
    db.close()
    answers_payload = {q["id"]: q["correct_index"] for q in stored_questions}
    submit_resp = client.post(f"/api/exams/{exam_id}/submit", json={"answers": answers_payload}, headers=headers)
    assert submit_resp.status_code == 200
    assert submit_resp.json()["score"] == 100
    assert submit_resp.json()["passed"] is True
    assert submit_resp.json()["detailed_results"][0]["citation"] is not None

    # After submission, the answer key is revealed.
    after_submit = client.get(f"/api/exams/{exam_id}", headers=headers)
    assert "correct_index" in after_submit.json()["questions"][0]

    # Cannot submit twice.
    assert client.post(f"/api/exams/{exam_id}/submit", json={"answers": answers_payload}, headers=headers).status_code == 400

    print_banner("5. Grounded RAG chatbot with citations")
    chat_payload = {"prompt": "What stairwell should be used during fire evacuation and what is the assembly point?"}
    chat_resp = client.post("/api/chat/query", json=chat_payload, headers=headers)
    assert chat_resp.status_code == 200
    assert len(chat_resp.json()["citations"]) > 0

    ungrounded_payload = {"prompt": "What is the capital of France?"}
    chat_resp_un = client.post("/api/chat/query", json=ungrounded_payload, headers=headers)
    assert chat_resp_un.status_code == 200
    ans_un = chat_resp_un.json()["response_text"]
    assert (
        "I cannot find the answer" in ans_un
        or "ไม่พบข้อมูล" in ans_un
        or "cannot" in ans_un.lower()
    )

    history_resp = client.get("/api/chat/history", headers=headers)
    assert history_resp.status_code == 200
    assert len(history_resp.json()) == 2

    print_banner("6. Personal learning dashboard")
    dash = client.get("/api/analytics/dashboard", headers=headers)
    assert dash.status_code == 200
    stats = dash.json()
    assert stats["completed_quizzes"] == 1
    assert stats["average_score"] == 100.0
    assert stats["streak_days"] == 1
    assert stats["read_documents_count"] >= 1
    assert len(stats["recent_scores"]) == 1
    assert stats["recent_scores"][0]["filename"] == "fire_safety_manual.pdf"

    print_banner("7. Admin-only audit logs")
    # A regular user is forbidden.
    assert client.get("/api/analytics/audit-logs", headers=headers).status_code == 403

    # Promote the other user to admin and confirm access.
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "intruder@example.com").first()
    admin.role = "admin"
    db.commit()
    db.close()
    audit_resp = client.get("/api/analytics/audit-logs", headers=other_headers)
    assert audit_resp.status_code == 200
    assert isinstance(audit_resp.json(), list)

    print_banner("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    setup_test_db()
    test_integration_flow()
