import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from database import Base
from config import settings

# Enums as python strings for SQLite compatibility, or ENUM types for postgres
ROLES = ("learner", "trainer", "tenant_admin", "global_admin")
FILE_STATUSES = ("pending", "processing", "ready", "error")
EXAM_STATUSES = ("draft", "published")

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

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name = Column(String(255), nullable=False)
    sso_domain = Column(String(255), unique=True, nullable=True) # Domain for SSO routing
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    files = relationship("File", back_populates="tenant", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="tenant", cascade="all, delete-orphan")
    embeddings = relationship("Embedding", back_populates="tenant", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="tenant", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="learner", nullable=False) # 'learner', 'trainer', 'tenant_admin', 'global_admin'
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    uploaded_files = relationship("File", back_populates="uploader", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class File(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    uploaded_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    storage_url = Column(Text, nullable=False)
    extracted_text = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False) # 'pending', 'processing', 'ready', 'error'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="files")
    uploader = relationship("User", back_populates="uploaded_files")
    embeddings = relationship("Embedding", back_populates="file", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="file", cascade="all, delete-orphan")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # Trainer (creator) or Learner (taker)
    questions = Column(JSON, nullable=False) # Structure: list of {id, question_text, options, correct_index, explanation, citation}
    user_answers = Column(JSON, nullable=True) # Map of question_id -> user choice index
    score = Column(Integer, nullable=True) # 0 to 100
    status = Column(String(50), default="draft", nullable=False) # 'draft', 'published'
    taken_at = Column(DateTime, nullable=True) # Null if still a draft/uncompleted template
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="exams")
    file = relationship("File", back_populates="exams")
    user = relationship("User", back_populates="exams")


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(EmbeddingType, nullable=False)
    chunk_index = Column(Integer, nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="embeddings")
    file = relationship("File", back_populates="embeddings")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(255), nullable=False) # e.g. "SSO_LOGIN", "FILE_UPLOAD", "EXAM_PUBLISH", "EXAM_SUBMIT", "CHAT_QUERY"
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
