import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import File, User, Exam, AuditLog
import schemas
from auth import get_current_user, require_role
from ai_service import generate_quiz

router = APIRouter(prefix="/exams", tags=["Assessment & Exam Generator"])

@router.get("/", response_model=List[Any])
def list_exams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all exams for the tenant workspace."""
    exams = db.query(Exam).filter(Exam.tenant_id == current_user.tenant_id).order_by(Exam.created_at.desc()).all()
    
    # Hide questions from list endpoint for efficiency, just return metadata
    result = []
    for exam in exams:
        result.append({
            "id": exam.id,
            "file_id": exam.file_id,
            "status": exam.status,
            "score": exam.score,
            "taken_at": exam.taken_at,
            "created_at": exam.created_at
        })
    return result

@router.post("/generate", response_model=schemas.ExamResponseFull)
def generate_exam_blueprint(
    request: schemas.ExamCreateRequest,
    req_meta: Request,
    current_user: User = Depends(require_role(["trainer", "tenant_admin"])),
    db: Session = Depends(get_db)
):
    """
    Generates a draft compliance/upskilling quiz using AI from manual content (FR-EXAM-01, FR-EXAM-02, FR-EXAM-04).
    Restricted to Corporate Trainers/Admins. Status is set to 'draft'.
    """
    file_record = db.query(File).filter(
        File.id == request.file_id,
        File.tenant_id == current_user.tenant_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source document not found in your tenant workspace."
        )
        
    if file_record.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Source document status is '{file_record.status}'. Ingestion must be complete before generating quizzes."
        )

    # Call AI generation service
    generated_questions = generate_quiz(
        text=file_record.extracted_text,
        filename=file_record.filename,
        num_questions=request.num_questions,
        difficulty=request.difficulty
    )
    
    if not generated_questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate quiz questions. Please try again."
        )

    # Save as draft
    exam = Exam(
        file_id=request.file_id,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id, # Creator trainer
        questions=generated_questions,
        status="draft"
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    # Log action
    audit = AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="EXAM_CREATE",
        details=f"Generated draft quiz (ID: {exam.id}) for manual '{file_record.filename}' with {len(generated_questions)} questions.",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()

    return exam


@router.get("/{exam_id}", response_model=Any)
def get_exam(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves a quiz (FR-AUTH-02, FR-AUTH-04).
    - If user is Learner: hides answers, explanations, and citations (prevent cheating).
    - If user is Trainer/Admin or Learner has already submitted/scored, returns full details.
    """
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.tenant_id == current_user.tenant_id
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam template not found in your tenant workspace."
        )
        
    # Security block: Learners cannot see drafts
    if current_user.role == "learner" and exam.status == "draft":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. This quiz is currently in 'draft' status by a Corporate Trainer."
        )

    # If user is learner and hasn't completed it yet, filter correct answers and explanations
    is_completed = exam.taken_at is not None
    is_privileged_user = current_user.role in ("trainer", "tenant_admin", "global_admin")

    if not is_privileged_user and not is_completed:
        # Hide sensitive details
        safe_questions = []
        for q in exam.questions:
            safe_questions.append({
                "id": q["id"],
                "question_text": q["question_text"],
                "options": q["options"]
            })
        return {
            "id": exam.id,
            "file_id": exam.file_id,
            "tenant_id": exam.tenant_id,
            "questions": safe_questions,
            "status": exam.status,
            "score": exam.score,
            "taken_at": exam.taken_at
        }
        
    # Return full questions with explanations/citations
    return {
        "id": exam.id,
        "file_id": exam.file_id,
        "tenant_id": exam.tenant_id,
        "questions": exam.questions,
        "user_answers": exam.user_answers,
        "score": exam.score,
        "status": exam.status,
        "taken_at": exam.taken_at
    }


@router.put("/{exam_id}", response_model=schemas.ExamResponseFull)
def update_exam_draft(
    exam_id: str,
    updated_questions: List[schemas.ExamQuestionFull],
    current_user: User = Depends(require_role(["trainer", "tenant_admin"])),
    db: Session = Depends(get_db)
):
    """Allows trainers to customize questions, answers, and explanations of a draft (FR-EXAM-04)."""
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.tenant_id == current_user.tenant_id
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam template not found."
        )
        
    if exam.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft exams can be updated. Published exams are locked for consistency."
        )
        
    # Convert schema list to serializable dictionary
    questions_list = [q.dict() for q in updated_questions]
    exam.questions = questions_list
    db.commit()
    db.refresh(exam)
    return exam


@router.post("/{exam_id}/publish", response_model=schemas.ExamResponseFull)
def publish_exam(
    exam_id: str,
    req_meta: Request,
    current_user: User = Depends(require_role(["trainer", "tenant_admin"])),
    db: Session = Depends(get_db)
):
    """Publishes a quiz blueprint so it becomes visible to employees/learners (FR-EXAM-04)."""
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.tenant_id == current_user.tenant_id
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam template not found."
        )
        
    exam.status = "published"
    
    audit = AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="EXAM_PUBLISH",
        details=f"Published exam {exam.id}. Ready for employees.",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()
    db.refresh(exam)
    return exam


@router.post("/{exam_id}/submit", response_model=schemas.ExamSubmitResponse)
def submit_exam_answers(
    exam_id: str,
    submission: schemas.ExamSubmitRequest,
    req_meta: Request,
    current_user: User = Depends(get_current_user), # Any employee can submit a published exam
    db: Session = Depends(get_db)
):
    """
    Submits student answers, calculates score (0-100), and records attempt details (FR-EXAM-03).
    Unlocks detailed feedback, reasons, and manual source citations (FR-EXAM-05).
    """
    exam = db.query(Exam).filter(
        Exam.id == exam_id,
        Exam.tenant_id == current_user.tenant_id
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found in your workspace."
        )
        
    if exam.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This exam is not active or has not been published yet."
        )

    # Grade the exam
    correct_count = 0
    total_questions = len(exam.questions)
    detailed_results = []
    
    for q in exam.questions:
        q_id = q["id"]
        correct_idx = q["correct_index"]
        user_choice = submission.answers.get(q_id)
        
        is_correct = (user_choice == correct_idx)
        if is_correct:
            correct_count += 1
            
        detailed_results.append({
            "question_id": q_id,
            "question_text": q["question_text"],
            "options": q["options"],
            "user_choice": user_choice,
            "correct_choice": correct_idx,
            "is_correct": is_correct,
            "explanation": q["explanation"],
            "citation": q["citation"]
        })
        
    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passed = score >= 80 # Standard B2B compliance threshold: 80% passing rate
    
    # Save student response score, answers and timestamps
    # For employee tracking, we can update or create user-specific attempts.
    # To keep DB schema simple (5.4 exams states 'user_id' -> FK to users table),
    # the exam entry stores the submission record.
    exam.user_answers = submission.answers
    exam.score = score
    exam.taken_at = datetime.utcnow()
    # Note: user_id links to the taker
    exam.user_id = current_user.id
    
    # Audit log
    audit = AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="EXAM_SUBMIT",
        details=f"Submitted exam {exam_id}. Score: {score}%. Passed: {passed}.",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()

    return schemas.ExamSubmitResponse(
        exam_id=exam.id,
        score=score,
        passed=passed,
        correct_answers_count=correct_count,
        total_questions=total_questions,
        detailed_results=detailed_results
    )
