from ..schemas.document_schema import Document
from ..database.models import Document
from sqlalchemy.orm import Session
from ..services.rag_service import store_chunks

def create_document(request,db:Session,user):
    new_doc=Document(
        user_id=user.id,
        title=request.title,
        content=request.content
    )
    db.add(new_doc)
    
    db.commit()
    db.refresh()
    

    store_chunks(new_doc.id, new_doc.content, db)

    return new_doc

