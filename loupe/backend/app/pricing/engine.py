from collections import Counter
from difflib import SequenceMatcher
from statistics import median

from app.models.schemas import (
    Comp,
    ConfidenceBreakdown,
    ConfidenceScore,
    HistoricalPoint,
    PriceRange,
    ValuationPayload,
    ValuationResult,
)
from app.pricing.adapters import ADAPTER_REGISTRY
from app.pricing.adapters.base import RawListing


def _similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, left.lower(), right.lower()).ratio()


def _percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0.0
    sorted_values = sorted(values)
    index = (len(sorted_values) - 1) * percentile
    lower = int(index)
    upper = min(lower + 1, len(sorted_values) - 1)
    weight = index - lower
    return sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight


def _remove_iqr_outliers(listings: list[RawListing]) -> list[RawListing]:
    if len(listings) < 4:
        return listings
    prices = [listing.price for listing in listings]
    q1 = _percentile(prices, 0.25)
    q3 = _percentile(prices, 0.75)
    iqr = q3 - q1
    low = q1 - 1.5 * iqr
    high = q3 + 1.5 * iqr
    return [listing for listing in listings if low <= listing.price <= high]


def _range_for(listings: list[RawListing]) -> PriceRange:
    prices = [listing.price for listing in listings]
    if not prices:
        return PriceRange(low=0, mid=0, high=0)
    return PriceRange(
        low=round(_percentile(prices, 0.25), 2),
        mid=round(median(prices), 2),
        high=round(_percentile(prices, 0.75), 2),
    )


def _confidence(
    ai_identification: float,
    required_fields: list[str],
    fields: dict,
    listings: list[RawListing],
    similarity_scores: list[float],
) -> ConfidenceScore:
    populated = len([field for field in required_fields if fields.get(field)])
    field_completeness = populated / len(required_fields) if required_fields else 1.0
    comp_volume = min(len(listings) / 10, 1.0)
    comp_similarity = sum(similarity_scores) / len(similarity_scores) if similarity_scores else 0.0
    sold_data_available = any(listing.listing_type == "sold" for listing in listings)
    historical_data_available = sold_data_available and len(listings) > 1
    overall = (
        ai_identification * 0.25
        + field_completeness * 0.25
        + comp_volume * 0.2
        + comp_similarity * 0.2
        + (0.1 if sold_data_available else 0)
    )
    return ConfidenceScore(
        overall=round(min(overall, 1.0), 2),
        breakdown=ConfidenceBreakdown(
            ai_identification=round(ai_identification, 2),
            field_completeness=round(field_completeness, 2),
            comp_volume=round(comp_volume, 2),
            comp_similarity=round(comp_similarity, 2),
            sold_data_available=sold_data_available,
            historical_data_available=historical_data_available,
        ),
    )


async def calculate_valuation(
    scan_id,
    category: str,
    fields: dict,
    handler,
    ai_identification: float,
) -> ValuationResult:
    query = handler.build_search_query(fields)
    listings: list[RawListing] = []
    for source_id in handler.pricing_sources:
        adapter = ADAPTER_REGISTRY.get(source_id)
        if adapter:
            listings.extend(await adapter.search(query, fields))

    scored = [(listing, _similarity(query, listing.title)) for listing in listings]
    filtered = [listing for listing, score in scored if score >= 0.35]
    similarity_scores = [score for _, score in scored if score >= 0.35]

    sold = _remove_iqr_outliers([listing for listing in filtered if listing.listing_type == "sold"])
    used = _remove_iqr_outliers(
        [listing for listing in filtered if listing.listing_type in ("sold", "used")]
    )
    new = _remove_iqr_outliers([listing for listing in filtered if listing.listing_type == "new"])
    current_pool = sold or used or filtered

    source_breakdown = Counter(listing.source for listing in filtered)
    comps = [
        Comp(
            source=listing.source,
            title=listing.title,
            price=listing.price,
            condition=listing.condition,
            sold_date=listing.sold_date,
            url=listing.url,
        )
        for listing in filtered
    ]
    historical = [
        HistoricalPoint(date=listing.sold_date, price_mid=listing.price)
        for listing in sold
        if listing.sold_date
    ]

    return ValuationResult(
        scan_id=scan_id,
        item={
            "category": category,
            "brand": fields.get("brand"),
            "model": fields.get("model") or fields.get("model_guess"),
            "fields": fields,
        },
        valuation=ValuationPayload(
            current_value=_range_for(current_pool),
            new_price=_range_for(new),
            used_price=_range_for(used),
        ),
        confidence=_confidence(
            ai_identification,
            handler.required_fields,
            fields,
            filtered,
            similarity_scores,
        ),
        comps=comps,
        historical=historical,
    )

