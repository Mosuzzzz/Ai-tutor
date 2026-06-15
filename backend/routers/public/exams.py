import copy
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models import Exam, File, User, AuditLog
import schemas
from services import ai_service

router = APIRouter(prefix="/exams", tags=["Personal Review Quiz"])


def _mask_questions(questions: list) -> list:
    """Hide the answer key until the owner submits their attempt."""
    masked = []
    for q in questions:
        q_copy = copy.deepcopy(q)
        q_copy.pop("correct_index", None)
        q_copy.pop("explanation", None)
        q_copy.pop("citation", None)
        masked.append(q_copy)
    return masked


@router.post("/generate")
def generate_exam(
    request: schemas.ExamCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a personal review quiz from one of the user's own documents."""
    file_record = db.query(File).filter(
        File.id == request.file_id,
        File.user_id == current_user.id,
    ).first()
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found in your workspace.")
    if file_record.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document is not ready for quiz generation (status: {file_record.status}).",
        )
    if not file_record.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Document has no extracted text. Cannot generate quiz.",
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
        user_id=current_user.id,
        questions=questions,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    db.add(AuditLog(
        user_id=current_user.id,
        action="EXAM_GENERATED",
        details=f"Generated exam {exam.id} from file {request.file_id} ({len(questions)} questions, difficulty={request.difficulty})",
    ))
    db.commit()

    # Newly generated quiz: return the full questions so the owner can preview, but
    # the answer key is masked until they submit.
    return {
        "id": exam.id,
        "file_id": exam.file_id,
        "questions": _mask_questions(exam.questions),
        "taken_at": None,
    }


@router.get("/{exam_id}")
def get_exam(exam_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Answer key is only revealed after the owner has submitted their attempt.
    questions = exam.questions if exam.taken_at else _mask_questions(exam.questions)

    return {
        "id": exam.id,
        "file_id": exam.file_id,
        "questions": questions,
        "score": exam.score,
        "taken_at": exam.taken_at.isoformat() if exam.taken_at else None,
    }


@router.put("/{exam_id}")
def update_exam_questions(exam_id: str, questions: list = Body(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    if exam.taken_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz already submitted and cannot be edited")
    exam.questions = questions
    db.commit()
    db.refresh(exam)
    return {
        "id": exam.id,
        "questions": _mask_questions(exam.questions),
        "taken_at": None,
    }


@router.post("/{exam_id}/submit")
def submit_exam(exam_id: str, payload: schemas.ExamSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.user_id == current_user.id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    if exam.taken_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz already submitted")

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
