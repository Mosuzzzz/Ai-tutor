from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import require_role, get_current_user
from models import AuditLog, Exam, File, User
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["Admin Analytics"])


def _format_iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _score_percentage(exam: Exam) -> int:
    if exam.score is not None:
        return int(exam.score)

    answers = exam.user_answers or {}
    questions = exam.questions or []
    total = len(questions)
    if not total:
        return 0

    correct = 0
    for question in questions:
        question_id = question.get("id")
        if answers.get(question_id) == question.get("correct_index"):
            correct += 1
    return int((correct / total) * 100)


def _build_score_trend(exams: list[Exam]) -> list[dict[str, object]]:
    trend: dict[str, list[int]] = defaultdict(list)
    for exam in exams:
        if not exam.taken_at:
            continue
        trend[exam.taken_at.date().isoformat()].append(_score_percentage(exam))

    return [
        {"date": date, "average_score": round(sum(scores) / len(scores), 1)}
        for date, scores in sorted(trend.items())
    ]


def _build_recent_scores(exams: list[Exam]) -> list[dict[str, object]]:
    recent = sorted(
        [exam for exam in exams if exam.taken_at],
        key=lambda exam: exam.taken_at,
        reverse=True,
    )[:5]

    return [
        {
            "id": exam.id,
            "exam_id": exam.id,
            "filename": exam.file.filename if exam.file else "Unknown document",
            "score": _score_percentage(exam),
            "submitted_at": _format_iso(exam.taken_at),
        }
        for exam in recent
    ]


def _build_skill_gaps(exams: list[Exam]) -> list[dict[str, object]]:
    low_scores = [exam for exam in exams if exam.taken_at and _score_percentage(exam) < 80]
    low_scores.sort(key=lambda exam: _score_percentage(exam))

    gaps: list[dict[str, object]] = []
    for exam in low_scores[:5]:
        score = _score_percentage(exam)
        total_questions = len(exam.questions or [])
        incorrect_count = max(0, total_questions - round((score / 100) * total_questions))
        gaps.append(
            {
                "topic": exam.file.filename if exam.file else exam.id,
                "error_rate": round(100 - score, 1),
                "incorrect_count": incorrect_count,
                "total_attempts": total_questions,
                "description": f"Average score on this document is {score}% across submitted quizzes.",
            }
        )
    return gaps


def _build_department_stats(db: Session, tenant_id: str) -> list[dict[str, object]]:
    docs = db.query(File).filter(File.tenant_id == tenant_id).all()
    by_status: dict[str, int] = defaultdict(int)
    for doc in docs:
        by_status[doc.status] += 1

    return [
        {"label": "ready_documents", "value": by_status.get("ready", 0)},
        {"label": "processing_documents", "value": by_status.get("processing", 0)},
        {"label": "pending_documents", "value": by_status.get("pending", 0)},
        {"label": "error_documents", "value": by_status.get("error", 0)},
    ]


@router.get("/usage")
def usage_overview(days: int = 30, db: Session = Depends(get_db), _=Depends(require_role(["global_admin"]))):
    """Simple usage metrics for admin dashboards (FR-ANALYTICS-01)."""
    since = datetime.utcnow() - timedelta(days=days)
    total_logins = db.query(AuditLog).filter(AuditLog.action == "PASSWORD_LOGIN", AuditLog.created_at >= since).count()
    total_uploads = db.query(AuditLog).filter(AuditLog.action == "FILE_UPLOAD", AuditLog.created_at >= since).count()
    return {"days": days, "total_logins": total_logins, "total_uploads": total_uploads}


@router.get("/dashboard")
def learner_dashboard(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Learner-facing dashboard metrics (FR-DASH-01)."""
    tenant_id = current_user.tenant_id
    tenant_exams = (
        db.query(Exam)
        .filter(Exam.tenant_id == tenant_id, Exam.taken_at.isnot(None))
        .all()
    )
    completed_quizzes = len(tenant_exams)
    average_score = round(sum(_score_percentage(exam) for exam in tenant_exams) / completed_quizzes, 1) if completed_quizzes else 0.0
    streak_days = len({exam.taken_at.date() for exam in tenant_exams if exam.taken_at})
    read_documents_count = db.query(File).filter(File.tenant_id == tenant_id, File.status == "ready").count()

    return {
        "completed_quizzes": completed_quizzes,
        "average_score": average_score,
        "streak_days": streak_days,
        "read_documents_count": read_documents_count,
        "recent_scores": _build_recent_scores(tenant_exams),
        "score_trend": _build_score_trend(tenant_exams),
    }


@router.get("/trainer")
def trainer_dashboard(db: Session = Depends(get_db), current_user = Depends(require_role(["trainer", "tenant_admin"]))):
    """Trainer diagnostics (FR-DASH-02)."""
    tenant_id = current_user.tenant_id
    total_employees = db.query(User).filter(User.tenant_id == tenant_id, User.role == "learner").count()
    tenant_exams = db.query(Exam).filter(Exam.tenant_id == tenant_id, Exam.taken_at.isnot(None)).all()
    scores = [_score_percentage(exam) for exam in tenant_exams]
    average_tenant_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    return {
        "total_employees": total_employees,
        "average_tenant_score": average_tenant_score,
        "total_quizzes_taken": len(tenant_exams),
        "skill_gaps": _build_skill_gaps(tenant_exams),
        "department_stats": _build_department_stats(db, tenant_id),
        "score_trend": _build_score_trend(tenant_exams),
    }


@router.get("/audit-logs")
def audit_logs(db: Session = Depends(get_db), _=Depends(require_role(["tenant_admin", "global_admin"]))):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    out = []
    for l in logs:
        out.append({"id": l.id, "user_id": l.user_id, "email": getattr(l, 'email', None), "action": l.action, "details": l.details, "ip_address": l.ip_address, "created_at": l.created_at})
    return out
