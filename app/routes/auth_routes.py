from fastapi import HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from ..database.session import SessionLocal
from ..database.models import User
from ..core.security import hash_password,verify_password,create_token
from ..schemas.auth_schema import SignupRequest,LoginRequest,TokenResponse
from ..core.dependencies import get_current_user
from ..core.dependencies import get_db

router=APIRouter(prefix="/chat",tags=["Chat"])


@router.post("/signup")
def signup(request:SignupRequest,db:Session=Depends(get_db)):
    Existing_user=db.query(User).filter(
        User.username==request.username,
        User.email==request.email).first()
    if Existing_user:
        raise HTTPException(status_code=400,detail="User Already Exists")
    new_user=User(
        username=request.username,
        email=request.email,
        password=hash_password(request.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message":"User created Successfuly"}

@router.post("/login",response_model=TokenResponse)
def login(request:LoginRequest,db:Session=Depends(get_db)):
    checklogin=db.query(User).filter(User.email==request.email).first()

    if not checklogin:
        raise HTTPException(status_code=401,detail="Invalid Credentials")
    
    if not verify_password(request.password,checklogin.password):
        raise HTTPException(status_code=404,detail="Email or Password Incorrect")
    
    token=create_token(checklogin.username)

    return { "access_token": token, 
            "token_type": "bearer"}

@router.get("/profile")
def profile(user:User=Depends(get_current_user)):
   return {
        "username": user.username,
        "email": user.email}