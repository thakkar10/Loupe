from app.categories.base import CategoryHandler, join_query_parts


class WatchesMechanicalHandler(CategoryHandler):
    slug = "watches.mechanical"
    required_fields = ["brand", "model", "reference_number", "condition", "box_papers"]
    optional_fields = ["case_size", "year", "movement"]
    pricing_sources = ["ebay"]
    field_question_overrides = {
        "box_papers": {"input_type": "boolean", "label": "Box And Papers Included"},
        "condition": {
            "input_type": "select",
            "options": ["new", "excellent", "good", "fair", "poor"],
        },
    }

    def build_search_query(self, fields: dict) -> str:
        return join_query_parts(
            [fields.get("brand"), fields.get("model"), fields.get("reference_number")]
        )

