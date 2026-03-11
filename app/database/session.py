from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker

URL="mysql+pymysql://root:Nanu%402002nanu@localhost/my_ai"
engine=create_engine(URL,)
SessionLocal=sessionmaker(bind=engine)
Base=declarative_base()