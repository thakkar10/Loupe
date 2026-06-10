from app.categories.base import CategoryHandler
from app.categories.electronics_laptop import ElectronicsLaptopHandler
from app.categories.electronics_phone import ElectronicsPhoneHandler
from app.categories.footwear_sneakers import FootwearSneakersHandler
from app.categories.household_general import HouseholdGeneralHandler
from app.categories.trading_cards_pokemon import TradingCardsPokemonHandler
from app.categories.watches_mechanical import WatchesMechanicalHandler

CATEGORY_REGISTRY: dict[str, CategoryHandler] = {
    "electronics.laptop": ElectronicsLaptopHandler(),
    "electronics.phone": ElectronicsPhoneHandler(),
    "watches.mechanical": WatchesMechanicalHandler(),
    "trading_cards.pokemon": TradingCardsPokemonHandler(),
    "footwear.sneakers": FootwearSneakersHandler(),
    "household.general": HouseholdGeneralHandler(),
}


def get_handler(category: str) -> CategoryHandler:
    handler = CATEGORY_REGISTRY.get(category)
    if not handler:
        raise ValueError(f"No handler registered for category: {category}")
    return handler

