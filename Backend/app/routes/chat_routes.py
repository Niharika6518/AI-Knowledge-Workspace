from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import distinct
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user, get_db
from ..database.models import ChatHistory, User
from ..schemas.chat_schema import ChatRequest
from ..services.chat_service import ask_question
from ..services.llm_service import stream_response

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/ask")
def ask_llm(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    response = ask_question(
        question=request.question,
        db=db,
        user_id=user.id,
        session_id=request.session_id,
        document_id=request.document_id,
        style=request.style,
    )

    answer_text = response["answer"]
    returned_session_id = response["session_id"]

    return StreamingResponse(
        stream_response(answer_text),
        media_type="text/plain",
        headers={"X-Session-Id": returned_session_id},
    )


@router.get("/history/{session_id}")
def chat_history(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.session_id == session_id,
            ChatHistory.user_id == user.id,
        )
        .order_by(ChatHistory.created_at.asc())
        .all()
    )

    return {
        "session_id": session_id,
        "messages": [
            {
                "role": msg.role,
                "message": msg.message,
                "created_at": msg.created_at,
            }
            for msg in history
        ],
    }


@router.get("/sessions")
def get_sessions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(distinct(ChatHistory.session_id))
        .filter(ChatHistory.user_id == user.id)
        .all()
    )

    session_list = []

    for session in sessions:
        session_id = session[0]

        first_message = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.session_id == session_id,
                ChatHistory.user_id == user.id,
                ChatHistory.role == "user",
            )
            .order_by(ChatHistory.created_at.asc())
            .first()
        )

        latest_message = (
            db.query(ChatHistory)
            .filter(
                ChatHistory.session_id == session_id,
                ChatHistory.user_id == user.id,
            )
            .order_by(ChatHistory.created_at.desc())
            .first()
        )

        session_list.append(
            {
                "id": session_id,
                "firstQuestion": first_message.message if first_message else "New Chat",
                "lastActivity": latest_message.created_at if latest_message else None,
            }
        )

    session_list.sort(key=lambda item: item["lastActivity"], reverse=True)

    for session in session_list:
        session.pop("lastActivity")

    return session_list


@router.delete("/session/{session_id}")
def delete_chat(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session_exists = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.session_id == session_id,
            ChatHistory.user_id == user.id,
        )
        .first()
    )

    if not session_exists:
        raise HTTPException(status_code=404, detail="Session does not exist")

    (
        db.query(ChatHistory)
        .filter(
            ChatHistory.session_id == session_id,
            ChatHistory.user_id == user.id,
        )
        .delete()
    )

    db.commit()

    return {"message": "Session deleted successfully"}