import json
import re
import os
from sqlalchemy.orm import Session
from tavily import TavilyClient
from dotenv import load_dotenv

from ..database.models import Document
from ..services.rag_service import retrieve_chunks
from ..services.llm_service import generate_response

# ================= LOAD ENV =================
load_dotenv()
tavily = TavilyClient(os.getenv("TAVILY_API_KEY"))

# ================= SAFE JSON PARSER =================
def safe_json_parse(response_text: str):
    try:
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if not match:
            return {}
        return json.loads(match.group())
    except Exception:
        return {}

# ================= TOOL SELECTOR =================
def choose_tool(question: str):
    prompt = f"""
You are an AI decision engine.

Select the most appropriate tool based on user intent.

TOOLS:

1. document_search
Use for:
- summarizing documents
- explaining content
- analyzing or describing documents

2. structured_data
Use ONLY if user asks for specific fields:
(name, email, phone, skills, etc.)

3. web_search
Use for:
- external or current information NOT in document

4. general_chat
Use for:
- casual conversation

---

User Question:
{question}

IMPORTANT:
Respond ONLY in valid JSON format:
{{"tool": "one_of_the_above_tools"}}
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": question}
    ]

    response = generate_response(messages)

    parsed = safe_json_parse(response)

    tool = parsed.get("tool")

    if not tool:
        tool = response.strip()

    if tool not in ["document_search", "structured_data", "web_search", "general_chat"]:
        tool = "general_chat"

    return tool

# ================= DOCUMENT SEARCH TOOL =================
def document_search_tool(messages, db: Session, user_id: int, document_id: int):

    question = messages[-1]["content"]

    chunks = retrieve_chunks(document_id, question, db)

    if not chunks:
        return "I could not find relevant information in the document."

    context = "\n\n".join(chunks[:5])

    system_prompt = f"""
You are an AI assistant specialized in document understanding.

STRICT RULES:
- Answer ONLY using the provided document context
- Do NOT add external knowledge
- If information is missing, say "Not found in the document"
- Keep answers clear and grounded

DOCUMENT CONTEXT:
{context}
"""

    enhanced_messages = [
        {"role": "system", "content": system_prompt},
        *messages
    ]

    return generate_response(enhanced_messages)

# ================= STRUCTURED DATA TOOL =================
def structured_data_tool(messages, db: Session, user_id: int, document_id: int):

    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()

    if not document or not document.structured_data:
        return "No structured data found for this document."

    structured_data = json.loads(document.structured_data)

    system_prompt = f"""
You are a structured data assistant.

STRICT RULES:
- Answer ONLY from the structured data
- Do NOT guess or infer anything

STRUCTURED DATA:
{json.dumps(structured_data, indent=2)}
"""

    enhanced_messages = [
        {"role": "system", "content": system_prompt},
        *messages
    ]

    return generate_response(enhanced_messages)

# ================= WEB SEARCH TOOL =================
def web_search_tool(messages, db: Session, user_id: int, document_id: int):

    question = messages[-1]["content"]

    try:
        search_results = tavily.search(query=question, max_results=5)
        context = "\n\n".join([r["content"] for r in search_results["results"]])
    except Exception:
        return "Web search failed."

    system_prompt = f"""
Use the following web results to answer the question accurately.

WEB RESULTS:
{context}
"""

    enhanced_messages = [
        {"role": "system", "content": system_prompt},
        *messages
    ]

    return generate_response(enhanced_messages)

# ================= GENERAL CHAT TOOL =================
def general_chat_tool(messages, db: Session, user_id: int, document_id: int):
    return generate_response(messages)

# ================= AGENT EXECUTION =================
def run_agent(messages, db: Session, user_id: int, document_id: int):

    question = messages[-1]["content"]

    tool = choose_tool(question)

    print(f"[AGENT] Question: {question}")
    print(f"[AGENT] Selected Tool: {tool}")

    if tool in ["document_search", "structured_data"] and not document_id:
        print("[AGENT] No document → switching to general_chat")
        tool = "general_chat"

    tool_map = {
        "document_search": document_search_tool,
        "structured_data": structured_data_tool,
        "web_search": web_search_tool,
        "general_chat": general_chat_tool
    }

    selected_tool = tool_map.get(tool, general_chat_tool)

    return selected_tool(messages, db, user_id, document_id)