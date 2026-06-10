from uuid import UUID, uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.categories import get_handler
from app.models.schemas import FollowUpAnswers, IdentificationResult, ValuationResult
from app.pricing.engine import calculate_valuation
from app.vision.identifier import IdentificationError, identify_item

router = APIRouter(tags=["scans"])
scan_store: dict[str, dict] = {}


def _normalize_known_fields(vision_result: dict) -> dict:
    known = dict(vision_result.get("known_fields") or {})
    if vision_result.get("brand") and not known.get("brand"):
        known["brand"] = vision_result["brand"]
    if vision_result.get("model_guess") and not known.get("model"):
        known["model"] = vision_result["model_guess"]
    return known


@router.post("/scans", response_model=IdentificationResult)
async def create_scan(file: UploadFile = File(...)):
    image_bytes = await file.read()
    try:
        vision_result = await identify_item(image_bytes)
    except IdentificationError as exc:
        raise HTTPException(
            status_code=502,
            detail={"message": str(exc), "source": "openai"},
        ) from exc

    try:
        handler = get_handler(vision_result["category"])
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    known_fields = _normalize_known_fields(vision_result)
    missing = handler.validate_completeness(known_fields)
    questions = handler.build_questions(missing)
    scan_id = uuid4()
    scan_store[str(scan_id)] = {
        "vision_result": vision_result,
        "category": vision_result["category"],
        "known_fields": known_fields,
        "questions": [question.model_dump() for question in questions],
        "valuation": None,
    }

    if not missing:
        scan_store[str(scan_id)]["valuation"] = (
            await calculate_valuation(
                scan_id=scan_id,
                category=vision_result["category"],
                fields=known_fields,
                handler=handler,
                ai_identification=vision_result["confidence"],
            )
        ).model_dump()

    return IdentificationResult(
        scan_id=scan_id,
        category=vision_result["category"],
        brand=vision_result.get("brand"),
        model_guess=vision_result.get("model_guess"),
        confidence=vision_result["confidence"],
        known_fields=known_fields,
        missing_fields=missing,
        search_query_draft=vision_result.get("search_query_draft", ""),
        ambiguity_notes=vision_result.get("ambiguity_notes"),
        questions=questions,
    )


@router.post("/scans/{scan_id}/answers", response_model=ValuationResult)
async def submit_answers(scan_id: UUID, body: FollowUpAnswers):
    scan = scan_store.get(str(scan_id))
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    handler = get_handler(scan["category"])
    parsed_answers = handler.parse_follow_up_answers(body.answers)
    all_fields = {**scan["known_fields"], **parsed_answers}
    missing = handler.validate_completeness(all_fields)
    if missing:
        raise HTTPException(
            status_code=422,
            detail={"message": "Missing required fields", "missing_fields": missing},
        )

    valuation = await calculate_valuation(
        scan_id=scan_id,
        category=scan["category"],
        fields=all_fields,
        handler=handler,
        ai_identification=scan["vision_result"]["confidence"],
    )
    scan["all_fields"] = all_fields
    scan["valuation"] = valuation.model_dump()
    return valuation


@router.get("/scans/{scan_id}")
async def get_scan(scan_id: UUID):
    scan = scan_store.get(str(scan_id))
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/scans/{scan_id}/history")
async def get_history(scan_id: UUID):
    scan = scan_store.get(str(scan_id))
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    valuation = scan.get("valuation") or {}
    return valuation.get("historical", [])
