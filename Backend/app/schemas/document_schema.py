from pydantic import BaseModel
from datetime import datetime

class Document(BaseModel):
    title:str |None=None
    content:str | None=None

class DocumentOut(BaseModel):
    id:int
    title:str
    created_at:datetime

    class Config:
        from_attribute=True