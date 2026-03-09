from ..schemas.document_schema import Document
from ..database.models import Document
from sqlalchemy.orm import Session
def create_document(request,db:Session,user):
    new_doc=Document(
        user_id=user.id,
        title=request.title,
        content=request.content
    )
    db.add(new_doc)
    db.commit()
    db.refresh()
    
    return new_doc
