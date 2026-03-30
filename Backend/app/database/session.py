from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker
import os

URL = os.getenv("DATABASE_URL")
engine=create_engine(URL,)
SessionLocal=sessionmaker(bind=engine)
Base=declarative_base()