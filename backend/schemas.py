from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Tenant Schemas ---
class TenantCreate(BaseModel):
    company_name: str
    sso_domain: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    company_name: str
    sso_domain: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Auth & SSO Schemas ---
class SSOCheckRequest(BaseModel):
    email: EmailStr

class SSOCheckResponse(BaseModel):
    sso_enabled: bool
    sso_domain: Optional[str] = None
    company_name: Optional[str] = None

class SSOLoginRequest(BaseModel):
    email: EmailStr
    saml_assertion: Optional[str] = None # Mock assertion token
    oidc_token: Optional[str] = None     # Mock ID token

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    user_id: str
    tenant_id: str
    email: str
    role: str

class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "learner" # 'learner', 'trainer', 'tenant_admin'

class UserResponse(BaseModel):
    id: str
    tenant_id: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    created_at: datetime
    last_active_at: datetime

    class Config:
        from_attributes = True

# --- File Schemas ---
class FileResponse(BaseModel):
    id: str
    tenant_id: str
    uploaded_by: str
    filename: str
    storage_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Recap Schemas ---
class RecapRequest(BaseModel):
    detail_level: str = "executive" # "executive" or "detailed"

class RecapResponse(BaseModel):
    file_id: str
    filename: str
    summary_markdown: str
    generated_at: datetime

# --- Exam Schemas ---
class ExamQuestion(BaseModel):
    id: str
    question_text: str
    options: List[str]
    # correct_index and explanation/citation are omitted in employee's preview
    # but shown after completion/submission or in trainer's edit

class ExamQuestionFull(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_index: int
    explanation: str
    citation: str

class ExamCreateRequest(BaseModel):
    file_id: str
    num_questions: int = Field(5, ge=5, le=20)
    difficulty: str = "medium" # "easy", "medium", "hard"

class ExamResponse(BaseModel):
    id: str
    file_id: str
    tenant_id: str
    questions: List[ExamQuestion] # Safe questions (no answers/explanations if taken_at is Null and user is learner)
    status: str # 'draft', 'published'
    score: Optional[int] = None
    taken_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExamResponseFull(BaseModel):
    id: str
    file_id: str
    tenant_id: str
    questions: List[ExamQuestionFull]
    user_answers: Optional[Dict[str, int]] = None
    score: Optional[int] = None
    status: str
    taken_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExamSubmitRequest(BaseModel):
    answers: Dict[str, int] # question_id -> chosen option index

class ExamSubmitResponse(BaseModel):
    exam_id: str
    score: int
    passed: bool
    correct_answers_count: int
    total_questions: int
    detailed_results: List[Dict[str, Any]] # includes correct answers, explanations, citations

# --- Chat Schemas ---
class ChatQueryRequest(BaseModel):
    prompt: str
    file_id: Optional[str] = None # Query specific file, or search entire workspace

class Citation(BaseModel):
    filename: str
    file_id: str
    chunk_index: int
    matched_text: str

class ChatResponse(BaseModel):
    response_text: str
    citations: List[Citation]
    chat_history_id: str

# --- Analytics Schemas ---
class SkillGapItem(BaseModel):
    topic: str
    error_rate: float
    incorrect_count: int
    total_attempts: int
    description: str

class ScoreTrendItem(BaseModel):
    date: str
    average_score: float

class LearnerDashboardResponse(BaseModel):
    completed_quizzes: int
    average_score: float
    streak_days: int
    read_documents_count: int
    recent_scores: List[Dict[str, Any]]
    score_trend: List[ScoreTrendItem]

class TrainerDashboardResponse(BaseModel):
    total_employees: int
    average_tenant_score: float
    total_quizzes_taken: int
    skill_gaps: List[SkillGapItem]
    department_stats: List[Dict[str, Any]]
    score_trend: List[ScoreTrendItem]

class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    email: str
    action: str
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
