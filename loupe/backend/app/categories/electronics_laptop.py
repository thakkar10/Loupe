from app.categories.base import CategoryHandler, join_query_parts


class ElectronicsLaptopHandler(CategoryHandler):
    slug = "electronics.laptop"
    required_fields = ["brand", "model", "year", "cpu", "ram", "storage", "condition"]
    optional_fields = ["battery_health", "color"]
    pricing_sources = ["ebay"]
    field_question_overrides = {
        "year": {"input_type": "number"},
        "ram": {"input_type": "number", "label": "RAM (GB)"},
        "storage": {"input_type": "number", "label": "Storage (GB)"},
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
                fields.get("year"),
                fields.get("cpu"),
                f"{fields.get('ram')}GB RAM" if fields.get("ram") else None,
                f"{fields.get('storage')}GB" if fields.get("storage") else None,
            ]
        )

