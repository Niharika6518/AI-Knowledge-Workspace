from sqlalchemy.orm import Session
from app.database.models import DocumentChunk
from ..services.embedding_service import generate_embeddings,generate_embedding

def chunk_text(text:str,chunk_size=1000,overlap=150):
    chunks=[]
    start=0
    text_length=len(text)

    while start<text_length:
        end=start+chunk_size
        chunk=text[start:end]
        chunks.append(chunk)
        start = end - overlap
    return chunks

def store_chunks(text:str,document_id,db:Session):
    chunks=chunk_text(text)
    embedding=generate_embeddings(chunks)
    for chunk, embedding in zip(chunks, embedding):
     chunk_add=DocumentChunk(
        document_id=document_id,
        chunk_text=chunk,
        embedding=embedding
    )
    db.add(chunk_add)
    db.commit()

def retrieve_chunks(document_id:int, question:str, db:Session, top_k:int=3):
    # Step 1: Convert question to embedding
    question_embedding = generate_embedding(question)

    results = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.embedding.l2_distance(question_embedding))
        .limit(top_k)
        .all()
    )

    # Step 3: Extract chunk text
    chunks = [chunk.chunk_text for chunk in results]

    return chunks

