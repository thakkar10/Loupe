from app.pricing.adapters.base import RawListing


class EbayAdapter:
    source_id = "ebay"
    supports_sold_listings = True
    supports_new_listings = True

    async def search(self, query: str, filters: dict) -> list[RawListing]:
        condition = str(filters.get("condition") or "good")
        base_title = query or "identified item"
        return [
            RawListing(
                source=self.source_id,
                title=f"{base_title} {condition} sold comp",
                price=1180,
                condition=condition,
                sold_date="2026-05-12",
                url="https://example.com/ebay/sold-1",
                listing_type="sold",
            ),
            RawListing(
                source=self.source_id,
                title=f"{base_title} excellent sold comp",
                price=1325,
                condition="excellent",
                sold_date="2026-05-28",
                url="https://example.com/ebay/sold-2",
                listing_type="sold",
            ),
            RawListing(
                source=self.source_id,
                title=f"{base_title} used active listing",
                price=1410,
                condition=condition,
                url="https://example.com/ebay/active-1",
                listing_type="used",
            ),
            RawListing(
                source=self.source_id,
                title=f"{base_title} new sealed active listing",
                price=1699,
                condition="new",
                url="https://example.com/ebay/active-2",
                listing_type="new",
            ),
        ]

