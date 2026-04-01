import json
import uuid

from sqlalchemy import desc
from sqlalchemy.orm import Session

from ..agents.tools import run_agent
from ..database.models import ChatHistory, Document
from ..services.rag_service import retrieve_chunks


def get_or_create_sessionid(session_id):
    return session_id or str(uuid.uuid4())


def save_user_question(question, db: Session, user_id: int, session_id: str):
    db.add(
        ChatHistory(
            user_id=user_id,
            session_id=session_id,
            role="user",
            message=question,
        )
    )
    db.commit()


def fetch_memory_window(
    db: Session,
    session_id: str,
    user_id: int,
    limit: int = 10,
):
    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.session_id == session_id,
            ChatHistory.user_id == user_id,
        )
        .order_by(desc(ChatHistory.created_at))
        .limit(limit)
        .all()
    )

    return list(reversed(history))


def save_assistant_reply(answer: str, db: Session, user_id: int, session_id: str):
    db.add(
        ChatHistory(
            user_id=user_id,
            session_id=session_id,
            role="assistant",
            message=answer,
        )
    )
    db.commit()


def format_structured_data(structured):
    if not structured:
        return None

    try:
        if isinstance(structured, dict):
            cleaned = {}

            for key, value in structured.items():
                if value in [None, "", [], {}]:
                    continue
                cleaned[key] = value

            if not cleaned:
                return None

            return "Document Structured Information:\n" + json.dumps(cleaned, indent=2)

        return "Document Structured Information:\n" + json.dumps(structured, indent=2)
    except Exception:
        return None


def format_rag_chunks(rag_chunks, max_chunks: int = 4):
    if not rag_chunks:
        return []

    cleaned_chunks = []

    for index, chunk in enumerate(rag_chunks[:max_chunks], start=1):
        if not chunk:
            continue

        chunk_text = str(chunk).strip()
        if not chunk_text:
            continue

        cleaned_chunks.append(f"Document Chunk {index}:\n{chunk_text}")

    return cleaned_chunks


def build_messages(history, question: str, style: str, context_chunks=None):
    style_map = {
        "normal": "Respond clearly and professionally.",
        "precise": "Respond precisely and briefly.",
        "detailed": "Provide structured and detailed explanations.",
        "casual": "Use a friendly conversational tone.",
        "technical": "Use precise technical explanations.",
    }

    has_document_context = bool(context_chunks)

    if has_document_context:
        system_prompt = f"""
You are a document-grounded AI assistant.

Your job is to answer the user's question using the provided document context and recent conversation history.

Rules:
- Use the document context whenever it is available
- Prefer document facts over general knowledge
- Do not invent or assume missing document facts
- If the answer is partially supported by the document, make that clear
- If the document does not contain enough information, clearly say so
- Keep the response relevant, accurate, and well-structured
- {style_map.get(style, "Respond clearly and professionally.")}
""".strip()
    else:
        system_prompt = f"""
You are a helpful AI assistant.

Your job is to answer the user's question clearly and accurately using your general knowledge and recent conversation history.

Rules:
- Give complete, relevant, and helpful answers
- Be accurate and well-structured
- If you are unsure, say so clearly
- {style_map.get(style, "Respond clearly and professionally.")}
""".strip()

    messages = [{"role": "system", "content": system_prompt}]

    if history:
        for message in history[-6:]:
            messages.append(
                {
                    "role": message.role,
                    "content": message.message,
                }
            )

    if has_document_context:
        context_text = "\n\n".join(context_chunks)
        messages.append(
            {
                "role": "user",
                "content": f"""
Question:
{question}

Document Context:
{context_text}

Instructions:
Answer the question using the document context first.
If the answer is not fully available in the document, clearly state that.
Do not invent document-specific facts.
""".strip(),
            }
        )
    else:
        messages.append(
            {
                "role": "user",
                "content": question,
            }
        )

    return messages


def ask_question(
    question: str,
    db: Session,
    user_id: int,
    session_id: str | None = None,
    document_id: int | None = None,
    style: str = "normal",
    structured=None,
):
    session_id = get_or_create_sessionid(session_id)

    history = fetch_memory_window(db, session_id, user_id)

    context_chunks = []
    structured = None

    if document_id:
        rag_chunks = retrieve_chunks(document_id, question, db)

        document = db.query(Document).filter(Document.id == document_id).first()

        if document and document.structured_data:
            try:
                structured = json.loads(document.structured_data)
            except Exception:
                structured = None

        structured_context = format_structured_data(structured)
        if structured_context:
            context_chunks.append(structured_context)

        context_chunks.extend(format_rag_chunks(rag_chunks, max_chunks=4))

    messages = build_messages(
        history=history,
        question=question,
        style=style,
        context_chunks=context_chunks,
    )

    answer = run_agent(
        messages,
        db,
        user_id,
        document_id,
    )

    save_user_question(question, db, user_id, session_id)
    save_assistant_reply(answer, db, user_id, session_id)

    return {
        "session_id": session_id,
        "answer": answer,
        "structured_data": structured,
    }