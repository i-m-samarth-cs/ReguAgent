import json
from datetime import datetime
from app.celery_app import celery_app
from sqlmodel import Session, select
from app.database import engine
from app.models import (
    MeasurableActionPoint,
    ValidationEvent,
    Evidence,
    AuditLog,
)
from app.agents.validation_agents import (
    DocumentationValidator,
    CodeChangeValidator,
    PolicyUpdateValidator,
    TestCoverageValidator,
)


@celery_app.task(bind=True, name="run_validation")
def run_validation(self, map_id: int):
    with Session(engine) as session:
        map_obj = session.get(MeasurableActionPoint, map_id)
        if not map_obj:
            return {"error": "MAP not found"}

        evidence_list = session.exec(
            select(Evidence).where(Evidence.map_id == map_id)
        ).all()

        input_data = {
            "map_id": map_id,
            "map_status": map_obj.status,
            "evidence_count": len(evidence_list),
            "title": map_obj.title,
            "priority": map_obj.priority,
        }

        validators = [
            DocumentationValidator(session),
            CodeChangeValidator(session),
            PolicyUpdateValidator(session),
            TestCoverageValidator(session),
        ]

        results = []
        for validator in validators:
            output = validator.run(input_data)
            event = ValidationEvent(
                map_id=map_id,
                validator_name=validator.name,
                result=output["result"],
                score=output.get("score", 0.0),
                notes=output.get("notes", ""),
                details=json.dumps(output),
                task_id=self.request.id or "",
            )
            session.add(event)
            results.append({"validator": validator.name, "result": output["result"], "score": output.get("score")})

        all_pass = all(r["result"] == "PASS" for r in results)
        any_fail = any(r["result"] == "FAIL" for r in results)

        if all_pass:
            map_obj.status = "validated"
        elif not any_fail:
            map_obj.status = "submitted"

        session.add(map_obj)

        log = AuditLog(
            action="validation_completed",
            entity_type="map",
            entity_id=map_id,
            details=json.dumps({"results": results, "task_id": self.request.id}),
        )
        session.add(log)
        session.commit()

        return {"map_id": map_id, "results": results, "final_status": map_obj.status}
