import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile, BackgroundTasks, Request
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import File as DBFile, User, Embedding, AuditLog
import schemas
from auth import get_current_user
from config import settings
from services.document_processor import extract_text_from_file, chunk_text
from services.ai_service import generate_recap
from services.embedding_service import generate_embedding

router = APIRouter(prefix="/files", tags=["Personal Document Library"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".png", ".jpg", ".jpeg", ".webp"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 Megabytes


def process_document_pipeline(file_id: str):
    """Background worker task to extract, chunk, and embed an uploaded document."""
    db = SessionLocal()
    try:
        file_record = db.query(DBFile).filter(DBFile.id == file_id).first()
        if not file_record:
            return

        file_record.status = "processing"
        db.commit()

        # 1. Text Extraction
        local_path = file_record.storage_url
        extracted_text = extract_text_from_file(local_path)
        file_record.extracted_text = extracted_text

        # 2. Text Chunking (~800 characters)
        chunks = chunk_text(extracted_text, chunk_size=800, overlap=150)

        # 3. Vector Embedding generation & Save (pgvector / SQLite fallback)
        for idx, chunk in enumerate(chunks):
            vector = generate_embedding(chunk)
            embedding_record = Embedding(
                file_id=file_id,
                chunk_text=chunk,
                embedding=vector,
                chunk_index=idx,
            )
            db.add(embedding_record)

        file_record.status = "ready"
        db.commit()

        # Auto-generate and cache executive summary so detail/dashboard pages are instant
        try:
            if extracted_text:
                summary = generate_recap(extracted_text, file_record.filename, detail_level="executive")
                file_record.summary_markdown = summary
                db.commit()
        except Exception:
            pass
    except Exception:
        db.rollback()
        file_record = db.query(DBFile).filter(DBFile.id == file_id).first()
        if file_record:
            file_record.status = "error"
            db.commit()
    finally:
        db.close()


def _serialize_related_exams(file_record: DBFile) -> list[dict[str, object]]:
    exams = sorted(file_record.exams, key=lambda exam: exam.created_at, reverse=True)
    return [
        {
            "id": exam.id,
            "score": exam.score,
            "taken_at": exam.taken_at.isoformat() if exam.taken_at else None,
            "created_at": exam.created_at.isoformat(),
        }
        for exam in exams
    ]


@router.post("/upload", response_model=schemas.FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    background_tasks: BackgroundTasks,
    req_meta: Request,
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Uploads a document to the user's personal workspace and queues it for ingestion."""
    # Verify file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    # Check file size (Read chunks to avoid storing huge files in memory)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)  # Reset pointer

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the maximum threshold of 50 MB (Actual: {file_size / (1024 * 1024):.2f} MB).",
        )

    # Secure local storage (simulating object storage)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}{ext}"
    local_storage_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(local_storage_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create DB record owned by the current user
    db_file = DBFile(
        user_id=current_user.id,
        filename=file.filename,
        storage_url=local_storage_path,
        status="pending",
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    db.add(AuditLog(
        user_id=current_user.id,
        action="FILE_UPLOAD",
        details=f"Uploaded file '{file.filename}' (Size: {file_size} bytes). Status: Pending ingestion.",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1",
    ))
    db.commit()

    # Trigger async parsing process
    background_tasks.add_task(process_document_pipeline, db_file.id)

    return db_file


@router.get("/", response_model=List[schemas.FileResponse])
def list_files(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists documents owned by the current user."""
    limit = min(limit, 100)
    files = (
        db.query(DBFile)
        .filter(DBFile.user_id == current_user.id)
        .order_by(DBFile.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return files


@router.get("/dashboard")
def documents_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns a document-library summary for the documents page."""
    files = (
        db.query(DBFile)
        .filter(DBFile.user_id == current_user.id)
        .order_by(DBFile.created_at.desc())
        .all()
    )

    status_counts = {"pending": 0, "processing": 0, "ready": 0, "error": 0}
    documents = []
    for file_record in files:
        status_counts[file_record.status] = status_counts.get(file_record.status, 0) + 1
        documents.append(
            {
                "id": file_record.id,
                "filename": file_record.filename,
                "status": file_record.status,
                "created_at": file_record.created_at.isoformat(),
                "summary_available": bool(file_record.summary_markdown),
                "summary_markdown": file_record.summary_markdown,
                "related_exams_count": len(file_record.exams),
            }
        )

    return {
        "total_documents": len(files),
        "status_counts": status_counts,
        "documents": documents,
    }


@router.get("/{file_id}/detail")
def document_detail(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns a single document detail payload including recap and related exams."""
    file_record = db.query(DBFile).filter(DBFile.id == file_id, DBFile.user_id == current_user.id).first()
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found in your workspace.")

    return {
        "id": file_record.id,
        "user_id": file_record.user_id,
        "filename": file_record.filename,
        "storage_url": file_record.storage_url,
        "status": file_record.status,
        "created_at": file_record.created_at.isoformat(),
        "extracted_text_preview": (file_record.extracted_text or "")[:1200],
        "summary_available": bool(file_record.summary_markdown),
        "summary_markdown": file_record.summary_markdown,
        "related_exams": _serialize_related_exams(file_record),
    }


@router.get("/{file_id}/status", response_model=schemas.FileStatusResponse)
def file_status(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lightweight endpoint for polling document processing status."""
    file_record = db.query(DBFile).filter(
        DBFile.id == file_id,
        DBFile.user_id == current_user.id,
    ).first()
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found in your workspace.")
    return schemas.FileStatusResponse(
        file_id=file_record.id,
        filename=file_record.filename,
        status=file_record.status,
        created_at=file_record.created_at,
    )


@router.get("/{file_id}/download")
def download_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Downloads a document the user owns."""
    file_record = db.query(DBFile).filter(
        DBFile.id == file_id,
        DBFile.user_id == current_user.id,
    ).first()

    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in your workspace.",
        )

    if not os.path.exists(file_record.storage_url):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file missing from storage.",
        )

    return FastAPIFileResponse(
        path=file_record.storage_url,
        filename=file_record.filename,
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: str,
    req_meta: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a document the user owns and purges its derived chunks/embeddings."""
    file_record = db.query(DBFile).filter(
        DBFile.id == file_id,
        DBFile.user_id == current_user.id,
    ).first()

    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in your workspace.",
        )

    # Remove physical file
    if os.path.exists(file_record.storage_url):
        try:
            os.remove(file_record.storage_url)
        except Exception:
            pass

    db.add(AuditLog(
        user_id=current_user.id,
        action="FILE_DELETE",
        details=f"Deleted file '{file_record.filename}' and all associated vector embeddings.",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1",
    ))

    # DB cascade removes related chunks/embeddings/exams automatically
    db.delete(file_record)
    db.commit()

    return
