import json
from app.agents.base import BaseAgent

EFFORT_MAP = {"critical": "1-2 weeks", "high": "3-5 days", "medium": "1-3 days", "low": "0.5-1 day"}

DEPARTMENT_HINTS = {
    "kyc": "compliance",
    "aml": "compliance",
    "capital": "risk",
    "liquidity": "risk",
    "reporting": "compliance",
    "fraud": "tech",
    "data": "tech",
    "consent": "tech",
    "breach": "tech",
    "officer": "legal",
    "policy": "legal",
    "insider": "legal",
    "documentation": "compliance",
    "solvency": "risk",
    "monitor": "tech",
    "implement": "tech",
    "maintain": "risk",
    "submit": "compliance",
    "appoint": "legal",
}

DEPT_CODE_MAP = {
    "compliance": 1,
    "risk": 2,
    "legal": 3,
    "tech": 4,
}


def guess_department(obligation_title: str, obligation_desc: str) -> str:
    text = (obligation_title + " " + obligation_desc).lower()
    for keyword, dept in DEPARTMENT_HINTS.items():
        if keyword in text:
            return dept
    return "compliance"


class MAPGeneratorAgent(BaseAgent):
    name = "MAPGeneratorAgent"
    prompt_file = "map_generation.md"

    def run_mock(self, input_data: dict) -> dict:
        obligation = input_data.get("obligation", {})
        title = obligation.get("title", "Regulatory Action")
        desc = obligation.get("description", "")
        priority = obligation.get("priority", "medium")
        dept_code = guess_department(title, desc)

        acceptance_criteria = [
            f"All required documentation submitted and approved",
            f"Internal audit trail established",
            f"Responsible team sign-off obtained",
            f"Regulatory acknowledgment received where applicable",
        ]

        return {
            "title": f"[MAP] {title}",
            "description": desc,
            "department_code": dept_code,
            "priority": priority,
            "effort_estimate": EFFORT_MAP.get(priority, "3-5 days"),
            "dependencies": ["Legal review", "IT infrastructure readiness"],
            "acceptance_criteria": acceptance_criteria,
            "evidence_requirement": "Policy document, implementation proof, testing evidence, and management sign-off",
        }
