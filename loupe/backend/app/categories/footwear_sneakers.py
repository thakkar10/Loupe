from app.categories.base import CategoryHandler, join_query_parts


class FootwearSneakersHandler(CategoryHandler):
    slug = "footwear.sneakers"
    required_fields = ["brand", "model", "size", "condition", "box_included"]
    optional_fields = ["colorway", "sku"]
    pricing_sources = ["ebay", "stockx"]
    field_question_overrides = {
        "size": {"input_type": "number", "label": "US Size"},
        "box_included": {"input_type": "boolean", "label": "Original Box Included"},
        "condition": {
            "input_type": "select",
            "options": ["new", "excellent", "good", "fair", "poor"],
        },
    }

    def build_search_query(self, fields: dict) -> str:
        return join_query_parts(
            [fields.get("brand"), fields.get("model"), fields.get("colorway"), fields.get("sku")]
        )

