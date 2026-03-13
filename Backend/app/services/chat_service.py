from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..database.models import ChatHistory
from ..services.rag_service import retrieve_chunks
from ..services.llm_service import generate_response
import uuid
from ..database.models import Document
import json
from ..agents.tools import run_agent

def get_or_create_sessionid(session_id):
    return session_id or str(uuid.uuid4())


def save_user_question(question, db: Session, user_id: int, session_id: str):

    db.add(ChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="user",
        message=question
    ))

    db.commit()


def fetch_memory_window(db: Session, session_id: str, user_id: int, limit: int = 10):

    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.session_id == session_id,
            ChatHistory.user_id == user_id
        )
        .order_by(desc(ChatHistory.created_at))
        .limit(limit)
        .all()
    )

    return list(reversed(history))


def save_assistant_reply(answer: str, db: Session, user_id: int, session_id: str):

    db.add(ChatHistory(
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        message=answer
    ))

    db.commit()


def build_messages(history, style: str, context_chunks=None):

    base_instruction = "You are a helpful AI assistant."

    style_map = {
        "normal": "Respond clearly and professionally.",
        "precise": "Respond precisely and briefly.",
        "detailed": "Provide structured detailed explanations.",
        "casual": "Use a friendly conversational tone.",
        "technical": "Use precise technical explanations."
    }

    system_prompt = f"{base_instruction} {style_map.get(style, '')}"

    messages = [{"role": "system", "content": system_prompt}]

    if context_chunks:

        context_text = "\n\n".join(context_chunks)

        messages.append({
            "role": "system",
            "content": f"Document Context:\n{context_text}"
        })

    for msg in history:

        messages.append({
            "role": msg.role,
            "content": msg.message
        })

    return messages


def ask_question(
    question: str,
    db: Session,    
    user_id: int,
    session_id: str | None = None,
    document_id: int | None = None,
    style: str = "normal",
    structured = None
):

    session_id = get_or_create_sessionid(session_id)

    save_user_question(question, db, user_id, session_id)

    history = fetch_memory_window(db, session_id, user_id)

    context_chunks = []
    rag_chunks=[]
    structured = None

    if document_id:

    # Retrieve RAG chunks
      rag_chunks = retrieve_chunks(document_id, question, db)

    # Retrieve document record
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    # Add structured data if available
    if document and document.structured_data:
        structured = json.loads(document.structured_data)

        context_chunks.append(
            f"Structured Data:\n{json.dumps(structured, indent=2)}"
        )

    # Add RAG chunks
    if rag_chunks:
        context_chunks.extend(rag_chunks)

    messages = build_messages(history, style, context_chunks)

    answer = run_agent(
    messages,
    db,
    user_id,
    document_id
)

    save_assistant_reply(answer, db, user_id, session_id)

    return {
        "session_id": session_id,
        "answer": answer,
        "structured_data": structured
    }