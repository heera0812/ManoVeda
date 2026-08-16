import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
key = os.getenv('GEMINI_API_KEY')
print('GEMINI_API_KEY present:', bool(key))
if not key:
    raise SystemExit(0)

client = genai.Client(api_key=key)
models = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-2.5-flash-preview-05-06',
    'gemini-2.5-flash-preview-04-17',
    'gemini-2.5-pro-preview-05-06',
]

for model_name in models:
    try:
        response = client.models.generate_content(
            model=model_name,
            contents='Say hi in one word',
            config=types.GenerateContentConfig(max_output_tokens=20, temperature=0.1),
        )
        print('OK', model_name, '->', (response.text or '').strip()[:50])
        break
    except Exception as e:
        print('FAIL', model_name, type(e).__name__, str(e)[:300])
