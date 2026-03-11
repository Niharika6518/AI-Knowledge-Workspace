import json
import re
from ..services.llm_service import generate_response


# ================= SAFE JSON PARSER =================

def safe_json_parse(response_text: str):
    """
    Cleans LLM output and safely extracts JSON.

    LLMs often return text like:
    ```json
    {...}
    ```

    This function removes formatting and extracts the JSON object.
    """

    response_text = response_text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{.*\}", response_text, re.DOTALL)

    if not match:
        return {}

    try:
        return json.loads(match.group())
    except:
        return {}


# ================= RESUME PARSER =================

def parse_resume(text: str):
    """
    Extract structured information from resumes.
    """

    prompt = """
You are a professional resume parser.

Return ONLY valid JSON.

Schema:
{
"name":"",
"email":"",
"phone":"",
"skills":[],
"education":[],
"experience":[],
"summary":""
}
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": text[:6000]}
    ]

    response = generate_response(messages)

    return safe_json_parse(response)


# ================= RENT AGREEMENT PARSER =================

def parse_rent_agreement(text: str):
    """
    Extract structured data from rent agreements.
    """

    prompt = """
Extract structured data from this rent agreement.

Return JSON:

{
"tenant_name":"",
"landlord_name":"",
"rent_amount":"",
"start_date":"",
"end_date":"",
"property_address":""
}
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": text[:6000]}
    ]

    response = generate_response(messages)

    return safe_json_parse(response)


# ================= GENERIC DOCUMENT PARSER =================

def parse_other(text: str):
    """
    General parser for other document types.
    """

    prompt = """
Analyze this document and extract structured insights.

Return JSON:

{
"summary":"",
"key_points":[],
"important_entities":[],
"important_dates":[]
}
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": text[:6000]}
    ]

    response = generate_response(messages)

    return safe_json_parse(response)


# ================= DOCUMENT CLASSIFIER =================

def classify_document(text: str):
    """
    Classifies document type before parsing.
    """

    prompt = """
Classify the document type.

Return JSON ONLY:
{"type": "resume"}

Possible types:
resume
rent_agreement
other
"""

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": text[:3000]}
    ]

    response = generate_response(messages)

    result = safe_json_parse(response)

    return result.get("type", "other")


# ================= MAIN PROCESSOR =================

def auto_process_document(text: str):
    """
    Main pipeline that:
    1️⃣ classifies the document
    2️⃣ runs the correct parser
    """

    doc_type = classify_document(text)

    if doc_type == "resume":
        structured = parse_resume(text)

    elif doc_type == "rent_agreement":
        structured = parse_rent_agreement(text)

    else:
        structured = parse_other(text)

    return {
        "doc_type": doc_type,
        "structured_data": structured
    }