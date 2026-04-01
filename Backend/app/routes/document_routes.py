import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user, get_db
from ..database.models import Document, User
from ..services.document_service import create_document

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    new_doc = create_document(
        title=title,
        file=file,
        db=db,
        user_id=user.id,
    )

    return {
        "id": new_doc.id,
        "title": new_doc.title,
    }


@router.get("/doclist")
def doc_list(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    docs = db.query(Document).filter(Document.user_id == user.id).all()
    return docs


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == user.id,
        )
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = doc.file_path

    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully"}