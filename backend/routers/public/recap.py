from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import File, User
import schemas
from auth import get_current_user
from services.ai_service import generate_recap

router = APIRouter(prefix="/recap", tags=["AI Recap - Document Summarization"])


def _get_ready_file(file_id: str, user_id: str, db: Session) -> File:
    file_record = db.query(File).filter(
        File.id == file_id,
        File.user_id == user_id,
    ).first()
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found in your workspace.")
    if file_record.status in ("pending", "processing"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document is currently in status '{file_record.status}'. Please wait for ingestion pipeline to complete.",
        )
    if file_record.status == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document ingestion failed. Cannot generate recap.")
    return file_record


@router.get("/{file_id}", response_model=schemas.RecapResponse)
def get_document_recap_cached(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the cached summary for a document, or 404 if not yet generated."""
    file_record = _get_ready_file(file_id, current_user.id, db)
    if not file_record.summary_markdown:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not yet generated. Use POST /recap/{file_id} to generate one.",
        )
    return schemas.RecapResponse(
        file_id=file_id,
        filename=file_record.filename,
        summary_markdown=file_record.summary_markdown,
        generated_at=datetime.utcnow(),
        cached=True,
    )


@router.post("/{file_id}", response_model=schemas.RecapResponse)
def generate_document_recap(
    file_id: str,
    request: schemas.RecapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates (or returns cached) a structured markdown recap for an uploaded document.
    Detail level: 'executive' (concise) or 'detailed' (comprehensive).
    """
    file_record = _get_ready_file(file_id, current_user.id, db)

    if file_record.summary_markdown:
        return schemas.RecapResponse(
            file_id=file_id,
            filename=file_record.filename,
            summary_markdown=file_record.summary_markdown,
            generated_at=datetime.utcnow(),
            cached=True,
        )

    summary_markdown = generate_recap(
        text=file_record.extracted_text,
        filename=file_record.filename,
        detail_level=request.detail_level,
    )

    file_record.summary_markdown = summary_markdown
    db.commit()

    return schemas.RecapResponse(
        file_id=file_id,
        filename=file_record.filename,
        summary_markdown=summary_markdown,
        generated_at=datetime.utcnow(),
        cached=False,
    )
