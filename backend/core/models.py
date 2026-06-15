import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from core.database import Base
from core.config import settings

# Single-user product: only two roles exist.
ROLES = ("user", "admin")
FILE_STATUSES = ("pending", "processing", "ready", "error")

# Dynamic embedding column selection
is_postgresql = settings.DATABASE_URL.startswith("postgresql")
if is_postgresql:
    try:
        from pgvector.sqlalchemy import Vector
        EmbeddingType = Vector(1536)
    except ImportError:
        EmbeddingType = JSON
else:
    EmbeddingType = JSON


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="user", nullable=False)  # 'user' or 'admin'
    auth_provider = Column(String(20), default="local", nullable=False)
    password_hash = Column(Text, nullable=True)
    email_verified_at = Column(DateTime, nullable=True)
    verification_token_hash = Column(String(64), nullable=True)
    verification_token_expires_at = Column(DateTime, nullable=True)
    reset_token_hash = Column(String(64), nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    magic_link_token_hash = Column(String(64), nullable=True)
    magic_link_token_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships — everything a user owns is personal to them.
    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="owner", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class File(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    storage_url = Column(Text, nullable=False)
    extracted_text = Column(Text, nullable=True)
    summary_markdown = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # 'pending', 'processing', 'ready', 'error'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="files")
    embeddings = relationship("Embedding", back_populates="file", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="file", cascade="all, delete-orphan")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # Owner who created & takes the quiz
    questions = Column(JSON, nullable=False)  # list of {id, question_text, options, correct_index, explanation, citation}
    user_answers = Column(JSON, nullable=True)  # Map of question_id -> chosen index
    score = Column(Integer, nullable=True)  # 0 to 100
    taken_at = Column(DateTime, nullable=True)  # Null until the owner submits answers
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    file = relationship("File", back_populates="exams")
    owner = relationship("User", back_populates="exams")


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(EmbeddingType, nullable=False)
    chunk_index = Column(Integer, nullable=False)

    # Relationships
    file = relationship("File", back_populates="embeddings")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(255), nullable=False)  # e.g. "FILE_UPLOAD", "EXAM_SUBMIT", "CHAT_QUERY"
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    replaced_by_token_hash = Column(String(64), nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="refresh_tokens")
