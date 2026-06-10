from app.categories.base import CategoryHandler, join_query_parts


class TradingCardsPokemonHandler(CategoryHandler):
    slug = "trading_cards.pokemon"
    required_fields = ["card_name", "set", "card_number", "condition", "graded"]
    optional_fields = ["grade", "language", "edition"]
    pricing_sources = ["ebay", "tcgplayer"]
    field_question_overrides = {
        "graded": {"input_type": "boolean"},
        "condition": {
            "input_type": "select",
            "options": ["near_mint", "lightly_played", "moderately_played", "damaged"],
        },
    }

    def build_search_query(self, fields: dict) -> str:
        grade = f"PSA {fields.get('grade')}" if fields.get("grade") else None
        return join_query_parts(
            [fields.get("card_name"), fields.get("set"), fields.get("card_number"), grade]
        )

