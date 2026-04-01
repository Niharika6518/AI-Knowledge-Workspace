import os
import time

from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

BASE_SYSTEM_PROMPT = """
You are a precise and reliable AI assistant.

RULES:
- Always follow system instructions strictly
- Do NOT hallucinate or invent information
- If unsure, say "I don't know"
- Keep answers clear, structured, and relevant
"""


def generate_response(messages: list, temperature: float = 0):
    try:
        if not messages or messages[0]["role"] != "system":
            messages = [
                {"role": "system", "content": BASE_SYSTEM_PROMPT},
                *messages,
            ]
        else:
            messages[0]["content"] = (
                BASE_SYSTEM_PROMPT + "\n\n" + messages[0]["content"]
            )

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=temperature,
            messages=messages,
        )

        response = completion.choices[0].message.content
        return response.strip() if response else ""

    except Exception as e:
        return f"LLM Error: {str(e)}"


def stream_response(text: str):
    for char in text:
        yield char
        time.sleep(0.01)