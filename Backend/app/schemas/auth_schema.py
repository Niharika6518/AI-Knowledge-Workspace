from pydantic import BaseModel

class SignupRequest(BaseModel):
    username:str
    email:str
    password:str

class LoginRequest(BaseModel):
    email:str
    password:str

class SignOut(BaseModel):
    username:str
    email:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str