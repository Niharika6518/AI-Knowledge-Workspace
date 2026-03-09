from pydantic import BaseModel
from datetime import datetime

class Document(BaseModel):
    title:str
    content:str

class DocumentOut(BaseModel):
    id:int
    title:str
    created_at:datetime

    class Config:
        orm_mode=True