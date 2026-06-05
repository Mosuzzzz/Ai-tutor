import json
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import require_role, get_current_user
from models import AuditLog, Exam, File, User
from datetime import datetime, timedelta
import schemas

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


def _build_recent_activity(db: Session, user_id: str, tenant_id: str) -> list[schemas.ActivityItem]:
    ACTIVITY_ACTIONS = ("FILE_UPLOAD", "CHAT_QUERY", "EXAM_SUBMIT", "EXAM_GENERATED")
    logs = (
        db.query(AuditLog)
        .filter(
            AuditLog.tenant_id == tenant_id,
            AuditLog.user_id == user_id,
            AuditLog.action.in_(ACTIVITY_ACTIONS),
        )
        .order_by(AuditLog.created_at.desc())
        .limit(10)
        .all()
    )
    items = []
    for log in logs:
        try:
            details_obj = json.loads(log.details) if log.details else {}
            summary = details_obj.get("query") or str(log.details or "")[:80]
        except Exception:
            summary = str(log.details or "")[:80]
        items.append(schemas.ActivityItem(action=log.action, details_summary=summary, created_at=log.created_at))
    return items


def _build_skill_breakdown(db: Session, user_id: str, tenant_id: str) -> list[schemas.SkillScore]:
    user_exams = (
        db.query(Exam)
        .filter(Exam.tenant_id == tenant_id, Exam.submitted_by == user_id, Exam.taken_at.isnot(None))
        .all()
    )
    by_file: dict[str, list[int]] = defaultdict(list)
    file_names: dict[str, str] = {}
    for exam in user_exams:
        by_file[exam.file_id].append(_score_percentage(exam))
        if exam.file_id not in file_names:
            file_names[exam.file_id] = exam.file.filename if exam.file else exam.file_id

    result = []
    for file_id, scores in list(by_file.items())[:8]:
        result.append(schemas.SkillScore(
            filename=file_names[file_id],
            file_id=file_id,
            average_score=round(sum(scores) / len(scores), 1),
            attempts=len(scores),
        ))
    return result


@router.get("/usage")
def usage_overview(days: int = 30, db: Session = Depends(get_db), _=Depends(require_role(["global_admin"]))):
    """Simple usage metrics for admin dashboards (FR-ANALYTICS-01)."""
    since = datetime.utcnow() - timedelta(days=days)
    total_logins = db.query(AuditLog).filter(AuditLog.action == "PASSWORD_LOGIN", AuditLog.created_at >= since).count()
    total_uploads = db.query(AuditLog).filter(AuditLog.action == "FILE_UPLOAD", AuditLog.created_at >= since).count()
    return {"days": days, "total_logins": total_logins, "total_uploads": total_uploads}


@router.get("/dashboard")
def learner_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Learner-facing dashboard metrics (FR-DASH-01)."""
    tenant_id = current_user.tenant_id
    user_id = current_user.id
    user_exams = (
        db.query(Exam)
        .filter(
            Exam.tenant_id == tenant_id,
            Exam.submitted_by == user_id,
            Exam.taken_at.isnot(None),
        )
        .all()
    )
    completed_quizzes = len(user_exams)
    average_score = round(sum(_score_percentage(exam) for exam in user_exams) / completed_quizzes, 1) if completed_quizzes else 0.0
    streak_days = len({exam.taken_at.date() for exam in user_exams if exam.taken_at})
    read_documents_count = db.query(File).filter(File.tenant_id == tenant_id, File.status == "ready").count()

    return {
        "completed_quizzes": completed_quizzes,
        "average_score": average_score,
        "streak_days": streak_days,
        "read_documents_count": read_documents_count,
        "recent_scores": _build_recent_scores(user_exams),
        "score_trend": _build_score_trend(user_exams),
        "recent_activity": _build_recent_activity(db, user_id, tenant_id),
        "skill_breakdown": _build_skill_breakdown(db, user_id, tenant_id),
    }


@router.get("/trainer")
def trainer_dashboard(db: Session = Depends(get_db), current_user=Depends(require_role(["trainer", "tenant_admin"]))):
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


@router.get("/trainer/students")
def trainer_students(db: Session = Depends(get_db), current_user=Depends(require_role(["trainer", "tenant_admin"]))):
    """Per-learner stats for trainer view."""
    tenant_id = current_user.tenant_id
    learners = db.query(User).filter(User.tenant_id == tenant_id, User.role == "learner").all()
    result = []
    for learner in learners:
        completed = [e for e in learner.exams if e.taken_at is not None and e.submitted_by == learner.id]
        scores = [_score_percentage(e) for e in completed]
        result.append(schemas.StudentStat(
            user_id=learner.id,
            full_name=learner.full_name,
            email=learner.email,
            completed_quizzes=len(completed),
            average_score=round(sum(scores) / len(scores), 1) if scores else 0.0,
            last_active_at=learner.last_active_at,
        ))
    return result


@router.get("/audit-logs")
def audit_logs(db: Session = Depends(get_db), _=Depends(require_role(["tenant_admin", "global_admin"]))):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "email": log.user.email if log.user else None,
            "action": log.action,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        }
        for log in logs
    ]
