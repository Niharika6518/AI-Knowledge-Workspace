import json
import re
from sqlalchemy.orm import Session
from tavily import TavilyClient
from ..database.models import Document
from ..services.rag_service import retrieve_chunks
from ..services.llm_service import generate_response
import os

tavily = TavilyClient(os.getenv("TAVILY_API_KEY"))

# ================= SAFE JSON PARSER =================

def safe_json_parse(response_text: str):

    response_text = response_text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{.*\}", response_text, re.DOTALL)

    if not match:
        return {}

    try:
        return json.loads(match.group())
    except:
        return {}

# ================= TOOL SELECTOR =================

def choose_tool(question: str):

    prompt = """
You are a tool routing agent.

Your job is to choose the correct tool.

TOOLS:

document_search
- Use when the question refers to an uploaded document.

structured_data
-Use ONLY when asking about fields extracted from a document such as:
name, email, skills, education, phone number, experience.

Do NOT use this tool if the user is asking to create or generate something.

web_search
- Use when the question requires internet knowledge such as news, sports results, recent events, or anything not in the uploaded document.

general_chat
-Use for general conversation, explanations, or generating content like:
resumes, emails, cover letters, summaries, etc.

IMPORTANT:
Return ONLY JSON.
Do NOT explain anything.

Example outputs:

{"tool": "document_search"}
{"tool": "structured_data"}
{"tool": "web_search"}
{"tool": "general_chat"}
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": question}
    ]

    response = generate_response(messages)

    result = safe_json_parse(response)

    return result.get("tool", "general_chat")


# ================= DOCUMENT SEARCH TOOL =================

def document_search_tool(messages, db: Session, user_id: int, document_id: int):

    question = messages[-1]["content"]

    chunks = retrieve_chunks(document_id, question, db)

    context = "\n\n".join(chunks) if chunks else "No relevant document context found."

    messages.insert(
        1,
        {
            "role": "system",
            "content": f"Document Context:\n{context}"
        }
    )

    return generate_response(messages)


# ================= STRUCTURED DATA TOOL =================

def structured_data_tool(messages, db: Session, user_id: int, document_id: int):

    question = messages[-1]["content"]

    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()

    if not document or not document.structured_data:
        return "No structured data found for this document."

    structured_data = json.loads(document.structured_data)

    messages.insert(
        1,
        {
            "role": "system",
            "content": f"Structured Data:\n{json.dumps(structured_data, indent=2)}"
        }
    )

    return generate_response(messages)

def web_search_tool(messages,db:Session,user_id:int,document_id:int):
    question=messages[-1]["content"]
    search_results=tavily.search(query=question,max_results=5)
    context= "\n\n".join([result["content"] for result in search_results["results"]])

    messages.insert(
        1,
        {
            "role": "system",
            "content": f"Web Search Results:\n{context}"
        }
    )

    return generate_response(messages)

# ================= GENERAL CHAT TOOL =================

def general_chat_tool(messages, db: Session, user_id: int, document_id: int):

    return generate_response(messages)


# ================= AGENT EXECUTION =================

def run_agent(messages, db: Session, user_id: int, document_id: int):

    question = messages[-1]["content"]

    tool = choose_tool(question)
    print("SELECTED TOOL:", tool)

    if tool == "document_search":
        return document_search_tool(messages, db, user_id, document_id)

    elif tool == "structured_data":
        return structured_data_tool(messages, db, user_id, document_id)
    
    elif tool == "web_search":
        return web_search_tool(messages, db, user_id, document_id)

    else:
        return general_chat_tool(messages, db, user_id, document_id)
    