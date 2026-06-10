from dataclasses import dataclass
from typing import Protocol


@dataclass
class RawListing:
    source: str
    title: str
    price: float
    condition: str | None
    url: str | None
    sold_date: str | None = None
    listing_type: str = "active"


class PricingAdapter(Protocol):
    source_id: str
    supports_sold_listings: bool
    supports_new_listings: bool

    async def search(self, query: str, filters: dict) -> list[RawListing]:
        ...

