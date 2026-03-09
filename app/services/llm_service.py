from groq import Groq

client=Groq(api_key="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")

def generate_response(prompt: str):

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return completion.choices[0].message.content

    except Exception as e:
        return f"LLM Error: {str(e)}"