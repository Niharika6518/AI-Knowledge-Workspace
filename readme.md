# AI Document Workspace

An intelligent full-stack document chat application that allows users to upload files, extract structured insights, and interact with documents using AI-powered conversational search.

This project combines document parsing, retrieval-augmented generation (RAG), streaming responses, persistent chat memory, and a polished modern UI.

---

## Features

### Authentication
- User signup and login
- JWT-based authentication
- Protected dashboard routes
- Persistent login session using local storage

### Document Management
- Upload PDF, DOCX, and TXT files
- Automatic text extraction
- Structured document parsing
- Document search and selection
- Delete uploaded documents
- Real-time document panel updates

### AI Chat
- General AI assistant when no document is selected
- Document-grounded answers when a document is attached
- Streaming token-by-token responses
- Persistent session-based memory
- Multiple chat sessions
- Session history and reload
- Chat deletion

### RAG Pipeline
- Smart chunking
- Embedding-based semantic retrieval
- Top relevant chunk selection
- Context-aware response generation
- Structured data extraction support

### UI / UX
- Modern glassmorphism dashboard
- Sidebar session management
- Document panel
- Streaming chat interface
- Auto-scroll optimization
- Responsive layout
- Smooth transitions and animations

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- React Markdown

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL / SQLite
- Uvicorn

### AI / NLP
- Groq API
- LLaMA 3.3 70B
- Embedding-based retrieval
- Custom RAG service

---

## Project Structure

```text
Final Chatbot/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database/
│   │   ├── schemas/
│   │   └── ...
│
├── uploads/
├── .gitignore
├── README.md
└── ...