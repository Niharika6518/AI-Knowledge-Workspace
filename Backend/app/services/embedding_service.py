from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str):
    vector = embedding_model.encode(text)
    return vector.tolist()


def generate_embeddings(texts: list[str]):
    embeddings = embedding_model.encode(texts)
    return [embedding.tolist() for embedding in embeddings]