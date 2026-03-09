from fastapi import HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from ..database.session import SessionLocal
from ..database.models import User,Document
from ..core.config import get_current_user
from ..schemas.chat_schema import ChatRequest
from ..services.chat_service import ask_question
router=APIRouter(prefix="/auth",tags=["Authentication"])

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/ask")
def ask_llm(request:ChatRequest,
            user:User=Depends(get_current_user),
            db:Session=Depends(get_db)):
    response=ask_question(
        question=request.question,
        document_id=request.document_id,
        db=db
    )    
    return{
        "answer":response
    }