from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey,JSON,VARCHAR
from sqlalchemy.sql import func
from .session import Base


# ================= USERS =================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ================= DOCUMENTS =================

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String(255))

    # full extracted text from file
    content = Column(Text)

    # path where file is stored
    file_path = Column(String(255), nullable=True)

    # document classification (resume / rent_agreement / other)
    doc_type = Column(String(255), default="unknown")

    # parsed structured information
    structured_data = Column(Text, nullable=True)

    upload_timestamp = Column(DateTime(timezone=True), server_default=func.now())


# ================= CHAT HISTORY =================

class ChatHistory(Base):
    __tablename__ = "chathistory"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    role = Column(String(50), nullable=False)

    message = Column(Text)

    # UUID session id
    session_id = Column(VARCHAR(255), index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ================= DOCUMENT CHUNKS (RAG) =================

class DocumentChunk(Base):
    __tablename__ = "documentchunks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    document_id = Column(Integer, ForeignKey("documents.id"))

    chunk_text = Column(Text, nullable=False)

    # vector embedding stored as JSON string
    embedding = Column(JSON)