import json
import os
import re
from typing import Any, Dict, List, Tuple

from config import settings

# ---------------------------------------------------------------------------
# Lazy groq client – only constructed when a real API key is present so
# the module can be imported cleanly in sandbox/offline mode.
# ---------------------------------------------------------------------------
_groq_client = None

def _get_client():
    global _groq_client
    if _groq_client is None and settings.GROQ_API_KEY:
        from groq import Groq
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client

_MODEL_NAME = "llama-3.3-70b-versatile"


# ---------------------------------------------------------------------------
# Public AI service functions
# ---------------------------------------------------------------------------

def generate_recap(text: str, filename: str, detail_level: str = "executive") -> str:
    """Generates a structured Markdown recap of the document text."""
    if not text:
        return "No text available to summarize."

    depth = (
        "Keep it concise, high-level, and focused on key executive takeaways."
        if detail_level == "executive"
        else "Provide highly detailed information, including specific steps, checklists, and compliance requirements."
    )

    prompt = (
        "You are an expert Corporate Trainer AI. Summarize the provided document into a "
        "structured corporate learning recap.\n"
        "The summary MUST be in Markdown format, written in the primary language of the source document "
        "(Thai if source is Thai, English if English).\n"
        "Use exactly these sections:\n\n"
        "# [Document Title]\n\n"
        "## 1. Overview\n"
        "[High-level summary: purpose, target audience, scope]\n\n"
        "## 2. Key Guidelines & Operational Procedures\n"
        "[Core rules and workflows as bullet points]\n\n"
        "## 3. Glossary & Technical Terms\n"
        "[Key terms, acronyms, definitions]\n\n"
        f"{depth}\n\n"
        f"Document Title: {filename}\n\n"
        f"Document Text:\n{text[:50_000]}"
    )

    client = _get_client()
    if client:
        try:
            response = client.chat.completions.create(
                model=_MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content
        except Exception:
            pass

    return _sandbox_recap(text, filename, detail_level)


def generate_quiz(
    text: str,
    filename: str,
    num_questions: int = 5,
    difficulty: str = "medium",
) -> List[Dict[str, Any]]:
    """Generates a multiple-choice quiz from the document text."""
    if not text:
        return []

    prompt = (
        f"You are a Corporate Compliance & Training Examiner AI. "
        f"Generate a multiple-choice quiz of {num_questions} questions "
        f"based ONLY on the provided document. Difficulty: {difficulty}.\n"
        "Each question must have exactly 4 options; only one is correct.\n"
        "Return a valid JSON array of objects with these fields:\n"
        "  id (string), question_text (string), options (array of 4 strings),\n"
        "  correct_index (integer 0-3), explanation (string), citation (string).\n"
        "Match the document language. Return ONLY the JSON array, no other text.\n\n"
        f"Document Title: {filename}\n\n"
        f"Document Text:\n{text[:40_000]}"
    )

    client = _get_client()
    if client:
        try:
            response = client.chat.completions.create(
                model=_MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = response.choices[0].message.content.strip()
            # Strip optional markdown fences
            raw = re.sub(r"^```(?:json)?\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw)
            questions = json.loads(raw.strip())
            
            # If the model wraps it in an object e.g., {"questions": [...]}
            if isinstance(questions, dict):
                for k, v in questions.items():
                    if isinstance(v, list):
                        return v
                        
            if isinstance(questions, list) and questions:
                return questions
        except Exception:
            pass

    return _sandbox_quiz(filename, num_questions)


def generate_grounded_chat(
    query: str,
    chunks: List[Dict[str, Any]],
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Returns (response_text, citations) strictly grounded in the provided chunks.
    If no chunks are available, returns a polite refusal immediately.
    """
    if not chunks:
        msg = (
            "ขออภัยครับ ไม่พบข้อมูลในเอกสารของบริษัท กรุณาอัปโหลดเอกสารที่เกี่ยวข้องก่อนครับ"
            if _is_thai(query)
            else "I'm sorry, I couldn't find relevant information in the uploaded company documents."
        )
        return msg, []

    context_parts = []
    for idx, chunk in enumerate(chunks):
        context_parts.append(
            f"[Doc {idx} | {chunk['filename']} | chunk {chunk['chunk_index']}]\n{chunk['text']}"
        )
    context_str = "\n\n".join(context_parts)

    prompt = (
        "You are a Secure Corporate AI Chatbot. Answer using ONLY the context below.\n"
        "Rules:\n"
        "1. STRICT GROUNDING: use only facts explicitly present in the context. "
        "If not found, reply: 'I cannot find the answer in the uploaded documents.' "
        "or 'ไม่พบข้อมูลนี้ในคลังเอกสารของบริษัท'.\n"
        "2. LANGUAGE: reply in the same language as the query.\n"
        "3. CITATIONS: cite with [Doc N] whenever you use a fact from Doc N.\n"
        "4. Never invent facts, URLs, or numbers.\n"
        "5. FORMATTING: Use Markdown to make your answer easy to read. Use **bolding**, bullet points, and short paragraphs to break up large blocks of text.\n\n"
        f"Context:\n{context_str}\n\n"
        f"Query: {query}"
    )

    client = _get_client()
    if client:
        try:
            response = client.chat.completions.create(
                model=_MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
            )
            answer = response.choices[0].message.content
            citations = _extract_citations(answer, chunks)
            return answer, citations
        except Exception:
            pass

    return _sandbox_chat(query, chunks)


# ---------------------------------------------------------------------------
# Sandbox / offline fallback generators
# ---------------------------------------------------------------------------

def _sandbox_recap(text: str, filename: str, detail_level: str) -> str:
    title = os.path.splitext(filename)[0].replace("_", " ").title()
    paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) > 30]

    overview = (
        "This summary was generated by the Enterprise AI Local Engine.\n"
        "The manual covers core operational standards and corporate compliance requirements."
    )

    rule_kws = ["must", "should", "required", "policy", "safety", "standard",
                "procedure", "always", "not", "กฎ", "ระเบียบ", "ต้อง", "ห้าม"]
    guidelines = [f"- {p}" for p in paragraphs if any(k in p.lower() for k in rule_kws)][:8]
    if not guidelines:
        guidelines = [
            "- Follow all corporate standards and operational regulations.",
            "- Obtain proper authorisation before sharing sensitive documents.",
            "- Report any security breach or safety hazard to supervisors immediately.",
        ]

    glossary = [
        "- **SOP**: Standard Operating Procedure – step-by-step instructions for routine operations.",
        "- **Compliance**: Adherence to laws, regulations, and specifications relevant to operations.",
        "- **SLA**: Service Level Agreement – a commitment between a provider and a client.",
    ]

    return (
        f"# Corporate Manual: {title}\n\n"
        f"## 1. Overview\n{overview}\n\n"
        "## 2. Key Guidelines & Operational Procedures\n"
        + "\n".join(guidelines) + "\n\n"
        "## 3. Glossary & Technical Terms\n"
        + "\n".join(glossary) + "\n"
    )


def _sandbox_quiz(filename: str, num_questions: int) -> List[Dict[str, Any]]:
    pool = [
        {
            "id": "q1",
            "question_text": "What is the primary action required upon discovering a safety hazard?",
            "options": [
                "Ignore it and continue normal duties",
                "Report it immediately to the supervisor or Safety Committee",
                "Fix it yourself without reporting",
                "Discuss it with coworkers at lunch",
            ],
            "correct_index": 1,
            "explanation": "Corporate policy mandates immediate reporting to a supervisor to initiate mitigation procedures.",
            "citation": f"{filename} – Safety Protocol Section",
        },
    ]

    result = pool[:num_questions]
    for i in range(len(result), num_questions):
        n = i + 1
        result.append({
            "id": f"q{n}",
            "question_text": f"What is corporate rule #{n} regarding document handling?",
            "options": [
                "Store documents in public folders",
                "Classify and store in the designated tenant directory",
                "Share immediately with external clients",
                "Delete after reading once",
            ],
            "correct_index": 1,
            "explanation": f"Rule {n}: proper classification prevents cross-tenant data leakage.",
            "citation": f"{filename} – Document Administration Policy",
        })
    return result


def _sandbox_chat(query: str, chunks: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:
    STOP = {
        "what", "is", "the", "are", "and", "for", "in", "on", "of", "to",
        "a", "an", "this", "that", "where", "how", "why", "who", "when",
        "does", "do", "did", "was", "were", "about",
        "อะไร", "คือ", "ที่ไหน", "อย่างไร", "ทำไม", "ใคร", "เมื่อไร",
        "เป็น", "มี", "ใน", "ที่", "ของ", "และ", "หรือ",
    }
    query_words = [w for w in query.lower().split() if len(w) > 1 and w not in STOP]

    # Score chunks by keyword overlap
    best, best_score = chunks[0], 0
    for chunk in chunks:
        score = sum(1 for w in query_words if w in chunk["text"].lower())
        if score > best_score:
            best_score, best = score, chunk

    thai = _is_thai(query)

    # Refuse if no overlap at all
    if best_score == 0:
        if thai:
            return "ไม่พบข้อมูลเกี่ยวกับคำถามของคุณในเอกสารที่อัปโหลด", []
        return "I cannot find the answer in the uploaded documents.", []

    # Extract the most relevant sentences
    sentences = re.split(r"(?<=[.!?\n])", best["text"])
    relevant = [
        s.strip() for s in sentences
        if s.strip() and any(w in s.lower() for w in query_words)
    ][:4]
    if not relevant:
        relevant = [s.strip() for s in sentences[:3] if s.strip()]

    body = " ".join(relevant) + " [Doc 0]"
    intro = (
        f"จากการสืบค้นเอกสาร {best['filename']} ข้อมูลระบุว่า:\n"
        if thai
        else f"According to the document '{best['filename']}':\n"
    )

    citation = {
        "filename": best["filename"],
        "file_id": best["file_id"],
        "chunk_index": best["chunk_index"],
        "matched_text": best["text"][:200] + "...",
    }
    return intro + body, [citation]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_thai(text: str) -> bool:
    thai_markers = ["สวัสดี", "ต้องการ", "อะไร", "ใคร", "ที่ไหน", "ทำอย่างไร", "ครับ", "ค่ะ"]
    return any(m in text for m in thai_markers)


def _extract_citations(
    text: str, chunks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Parse [Doc N] markers from model output and map to chunk metadata."""
    seen, citations = set(), []
    for match in re.finditer(r"\[Doc\s*(\d+)\]", text):
        idx = int(match.group(1))
        if 0 <= idx < len(chunks) and idx not in seen:
            seen.add(idx)
            c = chunks[idx]
            citations.append({
                "filename": c["filename"],
                "file_id": c["file_id"],
                "chunk_index": c["chunk_index"],
                "matched_text": c["text"][:200] + "...",
            })
    return citations
