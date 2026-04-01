from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

URL = os.getenv("DATABASE_URL")

engine = create_engine(URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()