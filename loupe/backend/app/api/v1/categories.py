from fastapi import APIRouter

from app.categories import CATEGORY_REGISTRY

router = APIRouter(tags=["categories"])


@router.get("/categories")
async def list_categories():
    return [
        {
            "category": slug,
            "required_fields": handler.required_fields,
            "optional_fields": handler.optional_fields,
            "pricing_sources": handler.pricing_sources,
        }
        for slug, handler in sorted(CATEGORY_REGISTRY.items())
    ]

