from abc import ABC, abstractmethod
from typing import Any

from app.models.schemas import FollowUpQuestion


class CategoryHandler(ABC):
    slug: str
    required_fields: list[str]
    optional_fields: list[str]
    pricing_sources: list[str]
    field_question_overrides: dict[str, dict[str, Any]] = {}

    def validate_completeness(self, fields: dict[str, Any]) -> list[str]:
        return [field for field in self.required_fields if not fields.get(field)]

    def build_questions(self, missing_fields: list[str]) -> list[FollowUpQuestion]:
        questions = []
        for field in missing_fields:
            override = self.field_question_overrides.get(field, {})
            questions.append(
                FollowUpQuestion(
                    field_key=field,
                    label=override.get("label", field.replace("_", " ").title()),
                    input_type=override.get("input_type", "text"),
                    options=override.get("options"),
                )
            )
        return questions

    @abstractmethod
    def build_search_query(self, fields: dict[str, Any]) -> str:
        raise NotImplementedError

    def parse_follow_up_answers(self, raw: dict[str, Any]) -> dict[str, Any]:
        return raw


def join_query_parts(parts: list[Any]) -> str:
    return " ".join(str(part).strip() for part in parts if part not in (None, "")).strip()

