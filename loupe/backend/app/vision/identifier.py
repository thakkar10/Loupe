import base64
import json
import os

from openai import AsyncOpenAI

SYSTEM_PROMPT = """
You are an item identification assistant for Loupe, a price intelligence app.
Analyze the image and return ONLY a JSON object with these fields:
- category: namespaced slug like "electronics.laptop", "electronics.phone", "watches.mechanical", "trading_cards.pokemon", "footwear.sneakers", "household.general"
- brand: string or null
- model_guess: string or null, only if clearly visible. Do not infer or hallucinate model numbers.
- confidence: float 0.0-1.0
- known_fields: object of fields you can determine from the image alone
- missing_fields: list of field names needed for accurate pricing but not visible
- search_query_draft: best-effort search string with what you know
- ambiguity_notes: string or null
Return only valid JSON. No explanation, no markdown.
"""


def mock_identification() -> dict:
    return {
        "category": "electronics.laptop",
        "brand": "Apple",
        "model_guess": "MacBook Pro",
        "confidence": 0.84,
        "known_fields": {"brand": "Apple", "model": "MacBook Pro", "condition": "good"},
        "missing_fields": ["year", "cpu", "ram", "storage"],
        "search_query_draft": "Apple MacBook Pro",
        "ambiguity_notes": "Mock response used because OPENAI_API_KEY is not configured.",
    }


async def identify_item(image_bytes: bytes) -> dict:
    if not os.getenv("OPENAI_API_KEY"):
        return mock_identification()

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    client = AsyncOpenAI()
    response = await client.chat.completions.create(
        model=os.getenv("OPENAI_VISION_MODEL", "gpt-4o"),
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                    }
                ],
            },
        ],
        max_tokens=800,
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)

