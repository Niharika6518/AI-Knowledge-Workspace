from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker

URL="postgresql://postgres:postgres@localhost:9000/ai_chatbot"
engine=create_engine(URL,)
SessionLocal=sessionmaker(bind=engine)
Base=declarative_base()