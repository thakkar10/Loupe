from app.categories.base import CategoryHandler, join_query_parts


class HouseholdGeneralHandler(CategoryHandler):
    slug = "household.general"
    required_fields = ["brand", "model", "condition", "dimensions"]
    optional_fields = ["material", "age"]
    pricing_sources = ["ebay"]
    field_question_overrides = {
        "condition": {
            "input_type": "select",
            "options": ["new", "excellent", "good", "fair", "poor"],
        },
    }

    def build_search_query(self, fields: dict) -> str:
        return join_query_parts(
            [fields.get("brand"), fields.get("model"), fields.get("dimensions")]
        )

