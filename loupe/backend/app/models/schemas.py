from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


InputType = Literal["select", "text", "number", "boolean"]


class FollowUpQuestion(BaseModel):
    field_key: str
    label: str
    input_type: InputType = "text"
    options: list[str] | None = None


class IdentificationResult(BaseModel):
    scan_id: UUID
    category: str
    brand: str | None
    model_guess: str | None
    confidence: float = Field(ge=0.0, le=1.0)
    known_fields: dict[str, Any]
    missing_fields: list[str]
    search_query_draft: str
    ambiguity_notes: str | None
    questions: list[FollowUpQuestion]


class FollowUpAnswers(BaseModel):
    answers: dict[str, Any]


class PriceRange(BaseModel):
    low: float
    mid: float
    high: float


class ConfidenceBreakdown(BaseModel):
    ai_identification: float = Field(ge=0.0, le=1.0)
    field_completeness: float = Field(ge=0.0, le=1.0)
    comp_volume: float = Field(ge=0.0, le=1.0)
    comp_similarity: float = Field(ge=0.0, le=1.0)
    sold_data_available: bool
    historical_data_available: bool


class ConfidenceScore(BaseModel):
    overall: float = Field(ge=0.0, le=1.0)
    breakdown: ConfidenceBreakdown


class Comp(BaseModel):
    source: str
    title: str
    price: float
    condition: str | None = None
    sold_date: str | None = None
    url: str | None = None


class HistoricalPoint(BaseModel):
    date: str
    price_mid: float


class ValuationPayload(BaseModel):
    current_value: PriceRange
    new_price: PriceRange
    used_price: PriceRange
    currency: str = "USD"


class ValuationResult(BaseModel):
    scan_id: UUID
    item: dict[str, Any]
    valuation: ValuationPayload
    confidence: ConfidenceScore
    comps: list[Comp]
    historical: list[HistoricalPoint]

