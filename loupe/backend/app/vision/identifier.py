import base64
import logging
import json
import os
from io import BytesIO

from openai import AsyncOpenAI
from PIL import Image, ImageOps

logger = logging.getLogger(__name__)

DEFAULT_VISION_MODEL = "gpt-4.1-mini"
DEFAULT_VISION_DETAIL = "low"
DEFAULT_MAX_TOKENS = 400
DEFAULT_MAX_IMAGE_EDGE = 768
DEFAULT_IMAGE_QUALITY = 80

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


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning("Invalid %s=%r; using default %s", name, raw, default)
        return default


def _prepare_image_for_vision(image_bytes: bytes) -> tuple[bytes, str]:
    max_edge = _int_env("OPENAI_IMAGE_MAX_EDGE", DEFAULT_MAX_IMAGE_EDGE)
    quality = _int_env("OPENAI_IMAGE_QUALITY", DEFAULT_IMAGE_QUALITY)

    try:
        with Image.open(BytesIO(image_bytes)) as image:
            image = ImageOps.exif_transpose(image)
            image.thumbnail((max_edge, max_edge))

            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")

            output = BytesIO()
            image.save(output, format="JPEG", quality=quality, optimize=True)
            optimized = output.getvalue()
            logger.info(
                "Prepared image for OpenAI vision: original_bytes=%s optimized_bytes=%s max_edge=%s quality=%s",
                len(image_bytes),
                len(optimized),
                max_edge,
                quality,
            )
            return optimized, "image/jpeg"
    except Exception as exc:
        logger.warning("Could not optimize image for OpenAI vision; using original bytes: %s", exc)
        return image_bytes, "image/jpeg"


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
        logger.info("Using mock identification because OPENAI_API_KEY is not configured")
        return mock_identification()

    model = os.getenv("OPENAI_VISION_MODEL", DEFAULT_VISION_MODEL)
    detail = os.getenv("OPENAI_VISION_DETAIL", DEFAULT_VISION_DETAIL)
    max_tokens = _int_env("OPENAI_VISION_MAX_TOKENS", DEFAULT_MAX_TOKENS)
    prepared_image, mime_type = _prepare_image_for_vision(image_bytes)
    b64 = base64.b64encode(prepared_image).decode("utf-8")

    logger.info(
        "Using OpenAI vision identification model=%s detail=%s max_tokens=%s",
        model,
        detail,
        max_tokens,
    )

    client = AsyncOpenAI()
    response = await client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{b64}",
                            "detail": detail,
                        },
                    }
                ],
            },
        ],
        max_tokens=max_tokens,
    )
    content = response.choices[0].message.content or "{}"
    return json.loads(content)
