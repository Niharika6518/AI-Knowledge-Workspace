from sqlalchemy.orm import Session
from ..database.models import DocumentChunk
from ..services.embedding_service import generate_embeddings, generate_embedding
import numpy as np


def chunk_text(text: str, chunk_size: int = 600, overlap: int = 120):

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap

    return chunks


def store_chunks(text: str, document_id: int, db: Session):

    chunks = chunk_text(text)
    embeddings = generate_embeddings(chunks)

    for chunk, embedding in zip(chunks, embeddings):

        chunk_row = DocumentChunk(
            document_id=document_id,
            chunk_text=chunk,
            embedding=embedding
        )

        db.add(chunk_row)

    db.commit()


def cosine_similarity(vec1, vec2):

    v1 = np.array(vec1)
    v2 = np.array(vec2)

    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


def retrieve_chunks(document_id: int, question: str, db: Session, top_k: int = 6):

    question_embedding = generate_embedding(question)

    # Get all chunks for the document
    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .all()
    )

    scored_chunks = []

    for chunk in chunks:

        similarity = cosine_similarity(question_embedding, chunk.embedding)

        scored_chunks.append((similarity, chunk.chunk_text))

    # Sort by similarity (highest first)
    scored_chunks.sort(reverse=True, key=lambda x: x[0])

    # Return top_k chunks
    top_chunks = [chunk[1] for chunk in scored_chunks[:top_k]]
    print("RETRIEVED CHUNKS:")
    for c in top_chunks:
     print(c[:200])

    return top_chunks