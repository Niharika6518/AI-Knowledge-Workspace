from fastapi import FastAPI
from .database.session import engine,Base
from .routes import auth_routes


app=FastAPI()
Base.metadata.create_all(bind=engine)
app.include_router(auth_routes.router)

@app.get("/")
def root():
    return{"message":"AI Knowledge Chatbot API Running"}
