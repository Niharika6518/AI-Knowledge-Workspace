from jose import JWTError,jwt
from passlib.context import CryptContext
from datetime import datetime,timedelta

pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")

def hash_password(password:str)->str:
    return pwd_context.hash(password)

def verify_password(plain_password:str,hashed_password)->bool:
    return pwd_context.verify(plain_password,hashed_password)

SECRET_KEY="MY_SECRET_KEY"
ALGORITHM="HS256"
ACCESS_TOKEN_MINUTES=60*24

def create_token(username:str)->str:
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_MINUTES)
    payload={
        "sub":username,
        "exp":expire
    }
    return jwt.encode(payload,SECRET_KEY,algorithm=[ALGORITHM])

def decode_token(token:str)->dict:
    try:
        return jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
    except JWTError:
        raise ValueError("Invalid or Expired Token")
