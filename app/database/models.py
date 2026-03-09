from sqlalchemy import Column,Integer,String,Text,DateTime,ForeignKey
from sqlalchemy.sql import func
from .session import Base

class User(Base):
    __tablename__="users"
    id=Column(Integer,index=True,primary_key=True)
    username=Column(String(255),index=True,unique=True)
    email=Column(String(255),index=True,unique=True)
    password=Column(String(255),index=True)
    created_at=Column(DateTime(timezone=True),server_default=func.now())

class Document(Base):
    __tablename__="documents"
    id=Column(Integer,index=True,primary_key=True)
    user_id=Column(Integer,ForeignKey("users.id"))
    title=Column(String(255))
    content=Column(Text)
    file_path=Column(String(255), nullable=True)
    document_type=Column(String(255),default="Unknown")
    upload_timestamp=Column(DateTime(timezone=True),server_default=func.now())

class ChatHistory(Base):
    __tablename__="chathistory"
    id=Column(Integer,index=True,primary_key=True)
    user_id=Column(Integer,ForeignKey("users.id"))
    session_id=Column(Integer,index=True)
    role=Column(String(50),nullable=False)
    message=Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())