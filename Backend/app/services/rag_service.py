from sqlalchemy.orm import Session
import numpy as np
import re

from ..database.models import DocumentChunk
from ..services.embedding_service import generate_embedding, generate_embeddings


def clean_text(text: str):
    text = re.sub(r"[▪●•]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 50):
    text = clean_text(text)
    sentences = re.split(r"(?<=[.!?]) +", text)

    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk.strip()) > 100:
            chunks.append(current_chunk.strip())

        if len(current_chunk) + len(sentence) <= chunk_size:
            current_chunk += " " + sentence
        else:
            chunks.append(current_chunk.strip())
            overlap_text = (
                current_chunk[-overlap:] if overlap < len(current_chunk) else current_chunk
            )
            current_chunk = overlap_text + " " + sentence

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


def store_chunks(text: str, document_id: int, db: Session):
    chunks = chunk_text(text)

    if not chunks:
        return

    embeddings = generate_embeddings(chunks)

    objects = [
        DocumentChunk(
            document_id=document_id,
            chunk_text=chunk,
            embedding=embedding,
        )
        for chunk, embedding in zip(chunks, embeddings)
    ]

    db.bulk_save_objects(objects)
    db.commit()


def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)

    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)

    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0

    return float(np.dot(v1, v2) / (norm_v1 * norm_v2))


def retrieve_chunks(document_id: int, question: str, db: Session, top_k: int = 6):
    if not question:
        return []

    question_embedding = generate_embedding(question)

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .all()
    )

    if not chunks:
        return []

    scored_chunks = []

    for chunk in chunks:
        similarity = cosine_similarity(question_embedding, chunk.embedding)

        if similarity > 0.05:
            scored_chunks.append((similarity, chunk.chunk_text))

    if not scored_chunks:
        return []

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_chunks = [chunk[1] for chunk in scored_chunks[:top_k]]

    print("\n[🔍 RAG DEBUG] Retrieved Chunks:\n")
    for i, (score, chunk) in enumerate(scored_chunks[:top_k]):
        print(f"[Chunk {i + 1}] (score={round(score, 3)}) {chunk[:200]}...\n")

    return top_chunks