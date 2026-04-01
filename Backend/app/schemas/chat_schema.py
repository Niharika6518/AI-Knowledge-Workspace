from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    
    question:str
    document_id:int| None=None
    session_id:str | None=None
    style: Optional[str] = "normal"

