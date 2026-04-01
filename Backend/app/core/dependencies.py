from fastapi import Header,Depends,HTTPException
from sqlalchemy.orm import Session
from ..core.security import decode_token
from ..database.models import User
from ..database.session import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(Authorization:str=Header(None),db:Session=Depends(get_db)):

 if not Authorization:
  raise HTTPException(status_code=401,detail="Invalid or Expired Token")
 
 token=Authorization.split(" ")[-1]
 payload=decode_token(token)
 username=payload.get("sub")
 user=db.query(User).filter(User.username==username).first()
 if not user:
  raise HTTPException(status_code=404,detail="Invalid Token")
 return user

