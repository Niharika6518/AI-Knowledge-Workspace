import json
import re

from ..services.llm_service import generate_response


def safe_json_parse(response_text: str):
    response_text = response_text.replace("```json", "").replace("```", "").strip()

    match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if not match:
        return {}

    try:
        return json.loads(match.group())
    except Exception:
        return {}


def parse_resume(text: str):
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
        {"role": "user", "content": text[:6000]},
    ]

    response = generate_response(messages)
    return safe_json_parse(response)


def parse_rent_agreement(text: str):
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
        {"role": "user", "content": text[:6000]},
    ]

    response = generate_response(messages)
    return safe_json_parse(response)


def parse_other(text: str):
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
        {"role": "user", "content": text[:6000]},
    ]

    response = generate_response(messages)
    return safe_json_parse(response)


def classify_document(text: str):
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
        {"role": "user", "content": text[:3000]},
    ]

    response = generate_response(messages)
    result = safe_json_parse(response)

    return result.get("type", "other")


def auto_process_document(text: str):
    doc_type = classify_document(text)

    if doc_type == "resume":
        structured = parse_resume(text)
    elif doc_type == "rent_agreement":
        structured = parse_rent_agreement(text)
    else:
        structured = parse_other(text)

    return {
        "doc_type": doc_type,
        "structured_data": structured,
    }