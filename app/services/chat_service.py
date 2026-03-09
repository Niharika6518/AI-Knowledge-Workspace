from ..services.embedding_service import generate_embedding
from sqlalchemy.orm import Session
from ..services.rag_service import retrieve_chunks
from ..services.llm_service import generate_response

def ask_question(question: str, db: Session, document_id: int | None = None):

    context = ""

    # Step 1: Retrieve relevant chunks if document exists
    if document_id:
        chunks = retrieve_chunks(document_id, question, db)
        context = "\n".join(chunks)

    # Step 2: Build prompt
    if context:
        prompt = f"""
Answer the question based only on the document context.

Context:
{context}

Question:
{question}

Answer:
"""
    else:
        prompt = question

    # Step 3: Send prompt to LLM
    response = generate_response(prompt)

    return response





