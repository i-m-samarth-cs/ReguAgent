from app.agents.base import BaseAgent


class AssignmentAgent(BaseAgent):
    name = "AssignmentAgent"
    prompt_file = "department_assignment.md"

    def run_mock(self, input_data: dict) -> dict:
        department_code = input_data.get("department_code", "compliance")
        return {
            "department_code": department_code,
            "confidence": 0.87,
            "reasoning": f"Based on obligation keywords and historical patterns, this MAP is best suited for the {department_code} team.",
            "alternative_departments": [],
        }
