from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_response(messages: list):

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0,
            messages= messages
        )

        return completion.choices[0].message.content

    except Exception as e:
        return f"LLM Error: {str(e)}"