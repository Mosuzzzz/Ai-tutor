from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenRequest(BaseModel):
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class AuthActionResponse(BaseModel):
    message: str
    email: Optional[EmailStr] = None
    user_id: Optional[str] = None
    requires_email_verification: Optional[bool] = None
    expires_in: Optional[int] = None
    dev_token: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str] = None
    refresh_expires_in: Optional[int] = None


class SessionResponse(BaseModel):
    authenticated: bool
    user: "UserResponse"
    accessible_route_groups: List[str]
    is_admin: bool


class TokenData(BaseModel):
    user_id: str
    email: str
    role: str


class UserResponse(BaseModel):
    id: str
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
    user_id: str
    filename: str
    storage_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class FileStatusResponse(BaseModel):
    file_id: str
    filename: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Recap Schemas ---
class RecapRequest(BaseModel):
    detail_level: str = "executive"  # "executive" or "detailed"


class RecapResponse(BaseModel):
    file_id: str
    filename: str
    summary_markdown: str
    generated_at: datetime
    cached: bool = False


# --- Exam (Personal Review Quiz) Schemas ---
class ExamQuestion(BaseModel):
    id: str
    question_text: str
    options: List[str]
    # correct_index / explanation / citation are hidden until the quiz is submitted.


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
    difficulty: str = "medium"  # "easy", "medium", "hard"
    instructions: Optional[str] = None


class ExamResponse(BaseModel):
    id: str
    file_id: str
    questions: List[ExamQuestion]  # answers hidden until taken_at is set
    score: Optional[int] = None
    taken_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExamSubmitRequest(BaseModel):
    answers: Dict[str, int]  # question_id -> chosen option index


class ExamSubmitResponse(BaseModel):
    exam_id: str
    score: int
    passed: bool
    correct_answers_count: int
    total_questions: int
    detailed_results: List[Dict[str, Any]]  # includes correct answers, explanations, citations


# --- Chat Schemas ---
class ChatQueryRequest(BaseModel):
    prompt: str
    file_id: Optional[str] = None  # Query a specific file, or search all of the user's documents


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
class ScoreTrendItem(BaseModel):
    date: str
    average_score: float


class ActivityItem(BaseModel):
    action: str
    details_summary: str
    created_at: datetime


class SkillScore(BaseModel):
    filename: str
    file_id: str
    average_score: float
    attempts: int


class LearnerDashboardResponse(BaseModel):
    completed_quizzes: int
    average_score: float
    streak_days: int
    read_documents_count: int
    recent_scores: List[Dict[str, Any]]
    score_trend: List[ScoreTrendItem]
    recent_activity: List[ActivityItem] = []
    skill_breakdown: List[SkillScore] = []


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
