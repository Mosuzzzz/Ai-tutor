import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import File, User, Embedding, AuditLog
import schemas
from auth import get_current_user
from services.embedding_service import generate_embedding, cosine_similarity
from services.ai_service import generate_grounded_chat

router = APIRouter(prefix="/chat", tags=["Private VPC AI Chatbot"])

@router.post("/query", response_model=schemas.ChatResponse)
def ask_ai_chatbot(
    request: schemas.ChatQueryRequest,
    req_meta: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Handles secure, grounded chat queries from documents (FR-CHAT-01–05).
    Vector search is tenant-scoped (FR-AUTH-02).
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt query cannot be blank.")

    # 1. Generate Query Vector
    query_vector = generate_embedding(request.prompt)

    # 2. Fetch candidate chunks bounded to current user tenant (FR-AUTH-02)
    # Filter by specific file if requested, otherwise search all tenant files
    query_base = db.query(Embedding).join(File).filter(Embedding.tenant_id == current_user.tenant_id)
    if request.file_id:
        query_base = query_base.filter(Embedding.file_id == request.file_id)
        
    embeddings_list = query_base.all()
    
    # 3. Compute cosine similarity in Python for uniform behaviour across
    #    SQLite (dev) and PostgreSQL+pgvector (prod).
    matched_chunks = []

    for emb in embeddings_list:
        # DB embeddings stored as list (JSON in SQLite/PG fallback) or native vector array
        emb_vector = emb.embedding
        if isinstance(emb_vector, str):
            emb_vector = json.loads(emb_vector)
            
        score = cosine_similarity(query_vector, emb_vector)
        # Cosine similarity range is [-1, 1]. We filter for positive correlation.
        if score >= 0.15:
            matched_chunks.append({
                "score": score,
                "text": emb.chunk_text,
                "filename": emb.file.filename,
                "file_id": emb.file_id,
                "chunk_index": emb.chunk_index
            })

    # Sort chunks by similarity score descending and take top 5
    matched_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_chunks = matched_chunks[:5]

    # 4. Generate grounded answer
    response_text, citations_list = generate_grounded_chat(request.prompt, top_chunks)

    # 5. Log chat session to Audit Logs for tracking (FR-CHAT-04, FR-AUTH-05)
    log_details = {
        "query": request.prompt,
        "file_id": request.file_id,
        "response": response_text,
        "citations": [{"filename": c["filename"], "chunk": c["chunk_index"]} for c in citations_list],
    }
    
    audit = AuditLog(
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="CHAT_QUERY",
        details=json.dumps(log_details, ensure_ascii=False),
        ip_address=req_meta.client.host if req_meta.client else "127.0.0.1"
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    # Re-map citations to schema structure
    schemas_citations = [
        schemas.Citation(
            filename=c["filename"],
            file_id=c["file_id"],
            chunk_index=c["chunk_index"],
            matched_text=c["matched_text"]
        ) for c in citations_list
    ]

    return schemas.ChatResponse(
        response_text=response_text,
        citations=schemas_citations,
        chat_history_id=audit.id
    )


@router.get("/history", response_model=List[Dict[str, Any]])
def get_chat_history(
    file_id: str = None,
    skip: int = 0,
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves personal chatbot interaction history logs (FR-CHAT-04). Optionally filter by file_id."""
    limit = min(limit, 100)
    logs = (
        db.query(AuditLog)
        .filter(
            AuditLog.tenant_id == current_user.tenant_id,
            AuditLog.user_id == current_user.id,
            AuditLog.action == "CHAT_QUERY",
        )
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    history = []
    for log in logs:
        try:
            details = json.loads(log.details)
        except Exception:
            details = {"query": "Unknown query", "response": log.details, "citations": [], "file_id": None}

        if file_id and details.get("file_id") != file_id:
            continue

        history.append({
            "id": log.id,
            "query": details.get("query"),
            "file_id": details.get("file_id"),
            "response": details.get("response"),
            "citations": details.get("citations", []),
            "timestamp": log.created_at,
        })

    return history[skip: skip + limit]
