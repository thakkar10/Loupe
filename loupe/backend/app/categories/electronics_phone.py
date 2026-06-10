from app.categories.base import CategoryHandler, join_query_parts


class ElectronicsPhoneHandler(CategoryHandler):
    slug = "electronics.phone"
    required_fields = ["brand", "model", "storage", "carrier_lock", "condition"]
    optional_fields = ["color", "battery_health"]
    pricing_sources = ["ebay"]
    field_question_overrides = {
        "storage": {"input_type": "number", "label": "Storage (GB)"},
        "carrier_lock": {
            "input_type": "select",
            "options": ["unlocked", "carrier_locked", "unknown"],
        },
        "condition": {
            "input_type": "select",
            "options": ["new", "excellent", "good", "fair", "poor"],
        },
    }

    def build_search_query(self, fields: dict) -> str:
        return join_query_parts(
            [
                fields.get("brand"),
                fields.get("model"),
                f"{fields.get('storage')}GB" if fields.get("storage") else None,
                fields.get("carrier_lock"),
            ]
        )

