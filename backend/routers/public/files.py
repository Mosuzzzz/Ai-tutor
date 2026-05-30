import os
import shutil
import uuid
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File as FastAPIFile, BackgroundTasks, Request
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import File as DBFile, User, Embedding, AuditLog
import schemas
from auth import get_current_user, require_role
from config import settings
from services.document_processor import extract_text_from_file, chunk_text
from services.embedding_service import generate_embedding

router = APIRouter(prefix="/files", tags=["Enterprise Classroom - Document Library"])

# Allowed corporate file extensions (2.4 Assumptions)
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".png", ".jpg", ".jpeg", ".webp"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 # 50 Megabytes (2.4 Assumptions)

def process_document_pipeline(file_id: str):
    """Background worker task to extract, chunk, and embed documents (FR-FILE-03, FR-FILE-04)."""
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
                tenant_id=file_record.tenant_id,
                chunk_text=chunk,
                embedding=vector,
                chunk_index=idx
            )
            db.add(embedding_record)
            
        file_record.status = "ready"
        db.commit()
    except Exception as e:
        db.rollback()
        file_record = db.query(DBFile).filter(DBFile.id == file_id).first()
        if file_record:
            file_record.status = "error"
            db.commit()
    finally:
        db.close()



@router.post("/upload", response_model=schemas.FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    background_tasks: BackgroundTasks,
    req_meta: Request,
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(require_role(["trainer", "tenant_admin", "global_admin"])),
    db: Session = Depends(get_db)
):
    """
    Uploads training manual, validates size/mime, and queues for ingestion (FR-FILE-01, FR-FILE-02).
    Access restricted to Corporate Trainers & Admins (FR-AUTH-04).
    """
    # Verify file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {ALLOWED_EXTENSIONS}"
        )
        
    # Check file size (Read chunks to avoid storing huge files in memory)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0) # Reset pointer
    
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum enterprise threshold of 50 MB (Actual: {file_size / (1024*1024):.2f} MB)."
        )

    # Secure storage locally (simulating AWS S3 bucket storage FR-FILE-02)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}{ext}"
    local_storage_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(local_storage_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create DB record (Row-level security bounded to current user tenant_id)
    db_file = DBFile(
        tenant_id=current_user.tenant_id,
        uploaded_by=current_user.id,
        filename=file.filename,
        storage_url=local_storage_path,
        status="pending"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Log security audit log
    audit = AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="FILE_UPLOAD",
        details=f"Uploaded file '{file.filename}' (Size: {file_size} bytes). Status: Pending ingestion.",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()

    # Trigger async parsing process (FR-FILE-03, FR-FILE-04)
    background_tasks.add_task(process_document_pipeline, db_file.id)

    return db_file



@router.get("/", response_model=List[schemas.FileResponse])
def list_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists files for the user's corporate tenant workspace (Enforces RLS FR-AUTH-02, FR-FILE-05)."""
    files = db.query(DBFile).filter(DBFile.tenant_id == current_user.tenant_id).all()
    return files


@router.get("/{file_id}/download")
def download_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Downloads file securely. Verifies tenant boundaries before serving (NFR-SEC-04).
    Simulates signed access verification.
    """
    file_record = db.query(DBFile).filter(
        DBFile.id == file_id, 
        DBFile.tenant_id == current_user.tenant_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found in your tenant workspace."
        )
        
    if not os.path.exists(file_record.storage_url):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file missing from secure vault."
        )
        
    return FastAPIFileResponse(
        path=file_record.storage_url,
        filename=file_record.filename
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: str,
    req_meta: Request,
    current_user: User = Depends(require_role(["trainer", "tenant_admin", "global_admin"])),
    db: Session = Depends(get_db)
):
    """
    Deletes the document and purges all derived text chunks/vector embeddings (FR-FILE-06).
    Restricted to Trainers & Admins.
    """
    file_record = db.query(DBFile).filter(
        DBFile.id == file_id,
        DBFile.tenant_id == current_user.tenant_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found in your tenant workspace."
        )

    # Remove physical file
    if os.path.exists(file_record.storage_url):
        try:
            os.remove(file_record.storage_url)
        except Exception:
            pass

    # Audit log
    audit = AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="FILE_DELETE",
        details=f"Deleted file '{file_record.filename}' and all associated vector embeddings.",
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1"
    )
    db.add(audit)
    
    # DB Delete cascade removes related Chunks/Embeddings automatically
    db.delete(file_record)
    db.commit()
    
    return
