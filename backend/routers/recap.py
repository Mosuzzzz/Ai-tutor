from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import File, User
import schemas
from auth import get_current_user
from ai_service import generate_recap

router = APIRouter(prefix="/recap", tags=["AI Recap - Document Summarization"])

@router.post("/{file_id}", response_model=schemas.RecapResponse)
def get_document_recap(
    file_id: str,
    request: schemas.RecapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a customized structured markdown recap for an uploaded document (FR-RECAP-01, FR-RECAP-02, FR-RECAP-03).
    Detail level: 'executive' (concise summary) or 'detailed' (comprehensive handbook guidelines).
    """
    file_record = db.query(File).filter(
        File.id == file_id,
        File.tenant_id == current_user.tenant_id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in your tenant workspace."
        )
        
    if file_record.status == "pending" or file_record.status == "processing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document is currently in status '{file_record.status}'. Please wait for ingestion pipeline to complete."
        )
        
    if file_record.status == "error":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document ingestion failed. Cannot generate recap."
        )
        
    summary_markdown = generate_recap(
        text=file_record.extracted_text,
        filename=file_record.filename,
        detail_level=request.detail_level
    )
    
    return schemas.RecapResponse(
        file_id=file_id,
        filename=file_record.filename,
        summary_markdown=summary_markdown,
        generated_at=datetime.utcnow()
    )
