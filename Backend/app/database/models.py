from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("Document", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String(255))
    content = Column(Text)

    file_path = Column(String(255), nullable=True)
    doc_type = Column(String(255), default="unknown")

    structured_data = Column(Text, nullable=True)

    upload_timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="documents")

    chunks = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan"
    )


class ChatHistory(Base):
    __tablename__ = "chathistory"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    role = Column(String(50), nullable=False)
    message = Column(Text)

    session_id = Column(String(255), index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())



class DocumentChunk(Base):
    __tablename__ = "documentchunks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"))

    chunk_text = Column(Text, nullable=False)

    embedding = Column(JSON)

    document = relationship("Document", back_populates="chunks")