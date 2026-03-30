from fastapi import Depends,HTTPException, APIRouter
from ..services.document_service import save_file,extract_text_from_file,create_document
from ..schemas.document_schema import Document,DocumentOut
from ..database.models import User,Document
from ..core.dependencies import get_current_user
from ..core.dependencies import get_db
from fastapi import UploadFile,File,Form
from sqlalchemy.orm import Session
from typing import List

router = APIRouter(prefix="/documents", tags=["Documents"])
@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):

    new_doc = create_document(
        title=title,
        file=file,
        db=db,
        user_id=user.id
    )

    return {
        "id": new_doc.id,
        "title": new_doc.title
    }
@router.get("/doclist")
def doclist(db: Session = Depends(get_db),
    user: User = Depends(get_current_user)):
   doc= db.query(Document).filter(Document.user_id == user.id
    ).all()
   return doc


@router.delete("/delete")
def delete_document( document_id:int,db: Session = Depends(get_db),
    user: User = Depends(get_current_user)):
    Doc=db.query(Document).filter(
        Document.id==document_id,
        Document.user_id == user.id
    ).first()
    if not Doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(Doc)
    db.commit()

    return {"message": "Document deleted successfully"}