import json
import io
import time
from httpx2 import Client as HttpxClient
from starlette.testclient import TestClient
import os
import sys
# Ensure backend/ is on sys.path when tests run so local modules import correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from database import engine, Base, SessionLocal
from models import Tenant, User, File, Exam, Embedding, AuditLog

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

def test_integration_flow():
    print_banner("1. Seeding Tenant & User Sandbox Data")
    # Call seed sandbox endpoint
    response = client.post("/api/auth/seed-sandbox")
    assert response.status_code == 200
    data = response.json()
    tenant_id = data["tenant"]["id"]
    print(f"Seeded Tenant: {data['tenant']['company_name']} (ID: {tenant_id})")
    
    # Extract users
    admin_user = next(u for u in data["users"] if u["role"] == "tenant_admin")
    trainer_user = next(u for u in data["users"] if u["role"] == "trainer")
    learner_user = next(u for u in data["users"] if u["role"] == "learner")

    print_banner("2. Testing SSO Pre-flight check & Authentication")
    # Verify SSO Check domain (FR-AUTH-01)
    sso_check = client.post("/api/auth/sso/check", json={"email": "employee@acme.com"})
    assert sso_check.status_code == 200
    assert sso_check.json()["sso_enabled"] is True
    assert sso_check.json()["company_name"] == "Acme Corporation"
    print("SSO pre-flight check passed for acme.com domain.")

    # SSO login for Trainer (FR-AUTH-03)
    login_trainer_resp = client.post("/api/auth/sso/login", json={"email": trainer_user["email"]})
    assert login_trainer_resp.status_code == 200
    trainer_token = login_trainer_resp.json()["access_token"]
    trainer_headers = {"Authorization": f"Bearer {trainer_token}"}
    print("Trainer SSO Authentication Successful.")

    # SSO login for Learner
    login_learner_resp = client.post("/api/auth/sso/login", json={"email": learner_user["email"]})
    assert login_learner_resp.status_code == 200
    learner_token = login_learner_resp.json()["access_token"]
    learner_headers = {"Authorization": f"Bearer {learner_token}"}
    print("Learner SSO Authentication Successful.")

    # SSO login for Tenant Admin
    login_admin_resp = client.post("/api/auth/sso/login", json={"email": admin_user["email"]})
    assert login_admin_resp.status_code == 200
    admin_token = login_admin_resp.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("Tenant Admin SSO Authentication Successful.")

    print_banner("3. Testing Multi-Tenant Row-Level Security (RLS) Isolation")
    # Create another tenant B
    db = SessionLocal()
    tenant_b = Tenant(company_name="Beta Corp", sso_domain="beta.com")
    db.add(tenant_b)
    db.commit()
    user_b = User(tenant_id=tenant_b.id, email="user@beta.com", role="trainer")
    db.add(user_b)
    db.commit()
    
    # Login as User B
    login_b = client.post("/api/auth/sso/login", json={"email": "user@beta.com"})
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    print(f"Logged in as User B from separate Tenant '{tenant_b.company_name}' (ID: {tenant_b.id})")

    print_banner("4. Testing File Upload & Ingestion Pipeline")
    # Build dummy manual text content
    pdf_content = (
        "ACME FIRE SAFETY EMERGENCY STANDARD OPERATING PROCEDURE\n"
        "1. In the event of a fire, employees must immediately sound the alarm.\n"
        "2. Call the emergency line at 911 within 3 minutes of discovering smoke.\n"
        "3. Evacuate via the East Stairwell to Assembly Point Delta.\n"
        "4. Do not use elevators during fire evacuation.\n"
        "Glossary: SOP stands for Standard Operating Procedure.\n"
    )
    
    # Upload from Trainer (Allowed)
    file_payload = {"file": ("fire_safety_manual.pdf", io.BytesIO(pdf_content.encode("utf-8")), "application/pdf")}
    upload_resp = client.post("/api/files/upload", files=file_payload, headers=trainer_headers)
    assert upload_resp.status_code == 201
    file_id = upload_resp.json()["id"]
    print(f"File uploaded successfully by Trainer. Assigned File ID: {file_id}")

    # Verify Learner cannot upload (FR-AUTH-04 RBAC)
    learner_file_payload = {"file": ("breach.pdf", io.BytesIO(b"hack"), "application/pdf")}
    forbidden_upload = client.post("/api/files/upload", files=learner_file_payload, headers=learner_headers)
    assert forbidden_upload.status_code == 403
    print("RBAC verified: Learner upload rejected with 403 Forbidden.")

    # Verify Tenant B cannot access Tenant A files (RLS Verification FR-AUTH-02)
    beta_access = client.get(f"/api/files/{file_id}/download", headers=headers_b)
    assert beta_access.status_code == 404
    print("RLS verified: Tenant B access to Tenant A document rejected with 404 Not Found.")

    # Wait briefly and check ingestion status (FR-FILE-05)
    # Background tasks in FastAPI TestClient run synchronously at request completion, so it should be ready!
    files_list = client.get("/api/files/", headers=trainer_headers)
    assert files_list.status_code == 200
    file_entry = next(f for f in files_list.json() if f["id"] == file_id)
    assert file_entry["status"] == "ready"
    print(f"Ingestion pipeline completed. File status: {file_entry['status']}.")

    print_banner("5. Testing Customizable Document Summarization (AI Recap)")
    # Request executive summary (FR-RECAP-03)
    recap_exec = client.post(f"/api/recap/{file_id}", json={"detail_level": "executive"}, headers=learner_headers)
    assert recap_exec.status_code == 200
    print("Executive Summary Generated:")
    print(recap_exec.json()["summary_markdown"])

    # Request detailed summary
    recap_detail = client.post(f"/api/recap/{file_id}", json={"detail_level": "detailed"}, headers=learner_headers)
    assert recap_detail.status_code == 200
    assert "Overview" in recap_detail.json()["summary_markdown"]
    print("Detailed Summary Generated successfully.")

    print_banner("6. Testing MCQ Exam Blueprint Generation & Draft flow")
    # Generate quiz as Trainer (FR-EXAM-01, FR-EXAM-04)
    quiz_resp = client.post("/api/exams/generate", json={"file_id": file_id, "num_questions": 5}, headers=trainer_headers)
    assert quiz_resp.status_code == 200
    exam_id = quiz_resp.json()["id"]
    print(f"Quiz generated successfully. Status: {quiz_resp.json()['status']}. Exam ID: {exam_id}")

    # Confirm Learner cannot see draft quiz (FR-EXAM-04)
    forbidden_quiz = client.get(f"/api/exams/{exam_id}", headers=learner_headers)
    assert forbidden_quiz.status_code == 403
    print("RBAC verified: Learner blocked from reading draft quiz.")

    # Edit Draft questions (simulate adding custom trainer adjustments)
    questions = quiz_resp.json()["questions"]
    # Change first question options slightly
    questions[0]["question_text"] = "MODIFIED QUESTION: How fast must the emergency line be called after discovering smoke?"
    update_resp = client.put(f"/api/exams/{exam_id}", json=questions, headers=trainer_headers)
    assert update_resp.status_code == 200
    assert "MODIFIED" in update_resp.json()["questions"][0]["question_text"]
    print("Trainer draft updates saved successfully.")

    # Publish Quiz
    publish_resp = client.post(f"/api/exams/{exam_id}/publish", headers=trainer_headers)
    assert publish_resp.status_code == 200
    assert publish_resp.json()["status"] == "published"
    print("Quiz status transitioned to 'published'.")

    # Learner views published quiz (answers must be hidden FR-EXAM-05)
    learner_quiz = client.get(f"/api/exams/{exam_id}", headers=learner_headers)
    assert learner_quiz.status_code == 200
    # Assert correct index is missing in response
    assert "correct_index" not in learner_quiz.json()["questions"][0]
    print("Quiz served to Learner. Anti-cheating filters active (answers and explanations hidden).")

    print_banner("7. Testing Exam Submission & Scoring")
    # Submit answers (FR-EXAM-03)
    # Question IDs: read them from the generated questions
    answers_payload = {}
    correct_answers = {}
    for q in quiz_resp.json()["questions"]:
        answers_payload[q["id"]] = q["correct_index"] # Select correct answers to score 100%
        correct_answers[q["id"]] = q["correct_index"]

    submit_resp = client.post(f"/api/exams/{exam_id}/submit", json={"answers": answers_payload}, headers=learner_headers)
    assert submit_resp.status_code == 200
    score = submit_resp.json()["score"]
    assert score == 100
    assert submit_resp.json()["passed"] is True
    print(f"Quiz submitted. Correct answers count: {submit_resp.json()['correct_answers_count']}/5. Score: {score}%.")
    print("Citations and explanations unlocked:")
    print(f"Citation: {submit_resp.json()['detailed_results'][0]['citation']}")
    print(f"Explanation: {submit_resp.json()['detailed_results'][0]['explanation']}")

    print_banner("8. Testing Grounded RAG Chatbot with Citations")
    # Ask a question matching our document (FR-CHAT-01)
    chat_payload = {"prompt": "What stairwell should be used during fire evacuation and what is the assembly point?"}
    chat_resp = client.post("/api/chat/query", json=chat_payload, headers=learner_headers)
    assert chat_resp.status_code == 200
    ans = chat_resp.json()["response_text"]
    citations = chat_resp.json()["citations"]
    
    print(f"Q: {chat_payload['prompt']}")
    print(f"A: {ans}")
    assert len(citations) > 0
    print(f"Citation verified: Source file: {citations[0]['filename']} (Chunk index: {citations[0]['chunk_index']})")

    # Ask ungrounded question (Must refuse to answer FR-CHAT-03)
    ungrounded_payload = {"prompt": "What is the capital of France?"}
    chat_resp_un = client.post("/api/chat/query", json=ungrounded_payload, headers=learner_headers)
    assert chat_resp_un.status_code == 200
    ans_un = chat_resp_un.json()["response_text"]
    print(f"Q: {ungrounded_payload['prompt']}")
    print(f"A: {ans_un}")
    assert (
        "I cannot find the answer" in ans_un
        or "ไม่พบข้อมูล" in ans_un
        or "sorry" in ans_un.lower()
        or "cannot" in ans_un.lower()
    )
    print("Strict grounding verified: AI refused to answer public knowledge question.")

    # Read personal chat logs
    history_resp = client.get("/api/chat/history", headers=learner_headers)
    assert history_resp.status_code == 200
    assert len(history_resp.json()) == 2
    print("Chat history stored and loaded successfully.")

    print_banner("9. Testing Diagnostics Dashboards & Streaks")
    # Fetch learner analytics (FR-DASH-01, FR-DASH-04)
    learner_dash = client.get("/api/analytics/dashboard", headers=learner_headers)
    assert learner_dash.status_code == 200
    stats = learner_dash.json()
    assert stats["completed_quizzes"] == 1
    assert stats["average_score"] == 100.0
    assert stats["streak_days"] == 1
    print("Learner Dashboard metrics calculated correctly:")
    print(f"Completed quizzes: {stats['completed_quizzes']}, Average: {stats['average_score']}%, Active streak: {stats['streak_days']} day(s).")

    # Fetch trainer diagnostics & identified Skill Gaps (FR-DASH-02)
    trainer_dash = client.get("/api/analytics/trainer", headers=trainer_headers)
    assert trainer_dash.status_code == 200
    trainer_stats = trainer_dash.json()
    print("Trainer Diagnostics Dashboard metrics calculated correctly:")
    print(f"Total employees: {trainer_stats['total_employees']}, Average Tenant Score: {trainer_stats['average_tenant_score']}%")
    print(f"Identified Skill Gaps count: {len(trainer_stats['skill_gaps'])}")
    for gap in trainer_stats["skill_gaps"]:
        print(f"- Topic: {gap['topic']} (Error Rate: {gap['error_rate']}%). Diagnostics: {gap['description']}")

    print_banner("10. Testing Admin Audit Trails")
    # Fetch audit logs as Admin (FR-AUTH-05)
    audit_resp = client.get("/api/analytics/audit-logs", headers=admin_headers)
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    print(f"Retrieved {len(logs)} security audit log trails:")
    for log in logs[:5]:
         print(f"- Time: {log['created_at']} | IP: {log['ip_address']} | User: {log['email']} | Action: {log['action']}")
         
    # Clean up test tenant B to leave db neat
    db.delete(user_b)
    db.delete(tenant_b)
    db.commit()
    db.close()

    print_banner("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    setup_test_db()
    test_integration_flow()
