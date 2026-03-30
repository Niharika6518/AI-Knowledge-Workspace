from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.session import engine,Base
from .routes import auth_routes, chat_routes, document_routes
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()

Base.metadata.create_all(bind=engine)
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ROUTERS
app.include_router(auth_routes.router)
app.include_router(chat_routes.router)
app.include_router(document_routes.router)


@app.get("/")
def root():
    return {"message": "AI Knowledge Workspace API Running"}