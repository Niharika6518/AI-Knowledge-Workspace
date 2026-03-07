from fastapi import FastAPI,Header,APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..core.security import decode_token
from ..routes.auth_routes import get_db
from ..database.models import User

def get_current_user(Authorization:str=Header(None),db:Session=Depends(get_db)):

 if not Authorization:
  raise HTTPException(status_code=404,detail="Invalid or Expired Token")
 
 token=Authorization.split(" ")[-1]
 payload=decode_token(token)
 username=payload.get("sub")
 user=db.query(User).filter(User.username==username)
 if not user:
  return HTTPException(status_code=404,detail="Invalid Token")
 return user
