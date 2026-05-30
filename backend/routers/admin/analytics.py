from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import require_role, get_current_user
from models import AuditLog, Exam, User
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["Admin Analytics"])


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
    # Completed quizzes for tenant (simple metric)
    completed_quizzes = db.query(Exam).filter(Exam.tenant_id == tenant_id, Exam.taken_at.isnot(None)).count()
    avg_score = 0.0
    if completed_quizzes:
        avg_score = float(db.query(Exam).filter(Exam.tenant_id == tenant_id, Exam.score != None).with_entities((Exam.score)).all()[0][0]) if completed_quizzes == 1 else float(sum([e.score or 0 for e in db.query(Exam).filter(Exam.tenant_id == tenant_id).all()]) / max(1, completed_quizzes))
    streak_days = 1 if completed_quizzes > 0 else 0
    return {"completed_quizzes": completed_quizzes, "average_score": avg_score, "streak_days": streak_days, "recent_scores": [], "score_trend": []}


@router.get("/trainer")
def trainer_dashboard(db: Session = Depends(get_db), current_user = Depends(require_role(["trainer", "tenant_admin"]))):
    """Trainer diagnostics (FR-DASH-02)."""
    tenant_id = current_user.tenant_id
    total_employees = db.query(User).filter(User.tenant_id == tenant_id, User.role == "learner").count()
    avg_score = 0.0
    scores = [e.score or 0 for e in db.query(Exam).filter(Exam.tenant_id == tenant_id).all()]
    if scores:
        avg_score = float(sum(scores) / len(scores))
    return {"total_employees": total_employees, "average_tenant_score": avg_score, "total_quizzes_taken": len(scores), "skill_gaps": [], "department_stats": [], "score_trend": []}


@router.get("/audit-logs")
def audit_logs(db: Session = Depends(get_db), _=Depends(require_role(["tenant_admin", "global_admin"]))):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    out = []
    for l in logs:
        out.append({"id": l.id, "user_id": l.user_id, "email": getattr(l, 'email', None), "action": l.action, "details": l.details, "ip_address": l.ip_address, "created_at": l.created_at})
    return out
