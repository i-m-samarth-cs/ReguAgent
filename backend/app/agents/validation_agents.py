import json
from typing import Literal
from app.agents.base import BaseAgent

ValidationResult = Literal["PASS", "FAIL", "NEEDS_REVIEW"]

MOCK_VALIDATION_PROFILES = {
    "completed": {"result": "PASS", "score": 0.92},
    "submitted": {"result": "NEEDS_REVIEW", "score": 0.65},
    "in_progress": {"result": "FAIL", "score": 0.28},
    "pending": {"result": "FAIL", "score": 0.1},
    "assigned": {"result": "FAIL", "score": 0.15},
    "validated": {"result": "PASS", "score": 0.95},
}


class DocumentationValidator(BaseAgent):
    name = "DocumentationValidator"
    prompt_file = "documentation_validator.md"

    def run_mock(self, input_data: dict) -> dict:
        status = input_data.get("map_status", "pending")
        evidence_count = input_data.get("evidence_count", 0)
        profile = MOCK_VALIDATION_PROFILES.get(status, {"result": "FAIL", "score": 0.1})
        score = min(1.0, profile["score"] + evidence_count * 0.05)
        result = "PASS" if score > 0.8 else ("NEEDS_REVIEW" if score > 0.5 else "FAIL")
        return {
            "result": result,
            "score": round(score, 2),
            "checks": {
                "policy_document_present": evidence_count > 0,
                "approval_trail": status in ("submitted", "validated", "completed"),
                "version_control": score > 0.6,
                "stakeholder_signoff": status in ("validated", "completed"),
            },
            "notes": f"Documentation completeness score: {score:.0%}. {'All required documents present.' if result == 'PASS' else 'Missing key documentation items.'}",
        }


class CodeChangeValidator(BaseAgent):
    name = "CodeChangeValidator"
    prompt_file = "code_change_validator.md"

    def run_mock(self, input_data: dict) -> dict:
        status = input_data.get("map_status", "pending")
        evidence_count = input_data.get("evidence_count", 0)
        score = 0.9 if status in ("validated", "completed") else (0.6 if status == "submitted" else 0.3)
        result = "PASS" if score > 0.8 else ("NEEDS_REVIEW" if score > 0.5 else "FAIL")
        return {
            "result": result,
            "score": round(score, 2),
            "checks": {
                "pr_linked": evidence_count > 0,
                "code_review_approved": status in ("validated", "completed"),
                "tests_added": score > 0.7,
                "deployment_confirmed": status == "completed",
            },
            "notes": f"Code change validation score: {score:.0%}.",
        }


class PolicyUpdateValidator(BaseAgent):
    name = "PolicyUpdateValidator"
    prompt_file = "policy_update_validator.md"

    def run_mock(self, input_data: dict) -> dict:
        status = input_data.get("map_status", "pending")
        score = 0.88 if status in ("validated", "completed") else (0.55 if status == "submitted" else 0.2)
        result = "PASS" if score > 0.8 else ("NEEDS_REVIEW" if score > 0.5 else "FAIL")
        return {
            "result": result,
            "score": round(score, 2),
            "checks": {
                "policy_updated": status in ("submitted", "validated", "completed"),
                "board_approved": status in ("validated", "completed"),
                "communicated_to_staff": status == "completed",
                "training_updated": status == "completed",
            },
            "notes": f"Policy update validation score: {score:.0%}.",
        }


class TestCoverageValidator(BaseAgent):
    name = "TestCoverageValidator"
    prompt_file = "code_change_validator.md"

    def run_mock(self, input_data: dict) -> dict:
        status = input_data.get("map_status", "pending")
        score = 0.91 if status in ("validated", "completed") else (0.58 if status == "submitted" else 0.25)
        result = "PASS" if score > 0.8 else ("NEEDS_REVIEW" if score > 0.5 else "FAIL")
        return {
            "result": result,
            "score": round(score, 2),
            "checks": {
                "unit_tests_written": score > 0.5,
                "integration_tests": score > 0.7,
                "coverage_above_80pct": score > 0.8,
                "regression_tests_pass": status in ("validated", "completed"),
            },
            "notes": f"Test coverage validation score: {score:.0%}.",
        }
