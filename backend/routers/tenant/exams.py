import copy
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, require_role
from models import Exam, File, User, AuditLog
import schemas
import uuid
from services import ai_service

router = APIRouter(prefix="/exams", tags=["Tenant Exam Management"])


@router.post("/generate")
def generate_exam(
    request: schemas.ExamCreateRequest,
    current_user: User = Depends(require_role(["trainer", "tenant_admin"])),
    db: Session = Depends(get_db),
):
    """Generate an exam from a document using AI (trainer only)."""
    file_record = db.query(File).filter(
        File.id == request.file_id,
        File.tenant_id == current_user.tenant_id,
    ).first()
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found in your tenant workspace.")
    if file_record.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File is not ready for quiz generation (status: {file_record.status}).",
        )
    if not file_record.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File has no extracted text. Cannot generate quiz.",
        )

    questions = ai_service.generate_quiz(
        text=file_record.extracted_text,
        filename=file_record.filename,
        num_questions=request.num_questions,
        difficulty=request.difficulty,
        instructions=request.instructions,
    )

    exam = Exam(
        file_id=request.file_id,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        questions=questions,
        status="draft",
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    db.add(AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="EXAM_GENERATED",
        details=f"Generated exam {exam.id} from file {request.file_id} ({len(questions)} questions, difficulty={request.difficulty})",
    ))
    db.commit()

    return {
        "id": exam.id,
        "file_id": exam.file_id,
        "tenant_id": exam.tenant_id,
        "questions": exam.questions,
        "status": exam.status,
    }


@router.get("/{exam_id}")
def get_exam(exam_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.tenant_id == current_user.tenant_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

    if exam.status == "draft" and current_user.role == "learner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Exam is draft and not visible to learners")

    questions = exam.questions
    if current_user.role == "learner":
        masked = []
        for q in questions:
            q_copy = copy.deepcopy(q)
            q_copy.pop("correct_index", None)
            q_copy.pop("explanation", None)
            q_copy.pop("citation", None)
            masked.append(q_copy)
        questions = masked

    return {
        "id": exam.id,
        "file_id": exam.file_id,
        "tenant_id": exam.tenant_id,
        "questions": questions,
        "status": exam.status,
    }


@router.put("/{exam_id}")
def update_exam_questions(exam_id: str, questions: list = Body(...), current_user: User = Depends(require_role(["trainer", "tenant_admin"])), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.tenant_id == current_user.tenant_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    exam.questions = questions
    db.commit()
    db.refresh(exam)
    return {
        "id": exam.id,
        "questions": exam.questions,
        "status": exam.status,
    }


@router.post("/{exam_id}/publish")
def publish_exam(exam_id: str, current_user: User = Depends(require_role(["trainer", "tenant_admin"])), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.tenant_id == current_user.tenant_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    exam.status = "published"
    db.commit()
    db.refresh(exam)
    return {"id": exam.id, "status": exam.status}


@router.post("/{exam_id}/submit")
def submit_exam(exam_id: str, payload: schemas.ExamSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.tenant_id == current_user.tenant_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    if exam.status != "published":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Exam not published")

    answers = payload.answers
    total = len(exam.questions)
    correct = 0
    detailed = []
    for q in exam.questions:
        qid = q.get("id")
        correct_index = q.get("correct_index")
        chosen = answers.get(qid)
        is_correct = (chosen is not None and chosen == correct_index)
        if is_correct:
            correct += 1
        detailed.append({
            "question_id": qid,
            "chosen": chosen,
            "correct_index": correct_index,
            "explanation": q.get("explanation"),
            "citation": q.get("citation"),
        })

    score = int((correct / total) * 100) if total > 0 else 0
    passed = score >= 50

    exam.user_answers = answers
    exam.score = score
    exam.taken_at = datetime.utcnow()
    db.commit()
    db.refresh(exam)

    db.add(AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="EXAM_SUBMIT",
        details=f"Submitted exam {exam.id}, score={score}%, passed={passed}",
    ))
    db.commit()

    return {
        "exam_id": exam.id,
        "score": score,
        "passed": passed,
        "correct_answers_count": correct,
        "total_questions": total,
        "detailed_results": detailed,
    }
