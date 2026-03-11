import json
import re

from ..services.llm_service import generate_response
from .tools import (
    document_search_tool,
    structured_data_tool,
    general_chat_tool
)


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
You are an AI agent.

Choose the best tool to answer the question.

Available tools:
- document_search
- structured_data
- general_chat

Return JSON only:

{"tool":"document_search"}
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": question}
    ]

    response = generate_response(messages)

    result = safe_json_parse(response)

    return result.get("tool", "general_chat")


# ================= AGENT EXECUTION =================

def run_agent(messages, db, user_id, document_id):

    question = messages[-1]["content"]

    tool = choose_tool(question)

    if tool == "document_search":
     return document_search_tool(messages, db, user_id, document_id)

    elif tool == "structured_data":
     return structured_data_tool(messages, db, user_id, document_id)

    else:
     return general_chat_tool(messages, db, user_id, document_id)