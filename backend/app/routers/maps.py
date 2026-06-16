import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select, col
from typing import List, Optional
from app.database import get_session
from app.models import (
    MeasurableActionPoint,
    Obligation,
    Department,
    Assignment,
    Evidence,
    AuditLog,
)
from app.schemas.schemas import MAPStatusUpdate, MAPAssignRequest, EvidenceSubmitRequest
from app.auth.dependencies import get_current_user
from app.models import User
from app.agents.map_generator_agent import MAPGeneratorAgent, DEPT_CODE_MAP

router = APIRouter(prefix="/api/maps", tags=["maps"])


def _map_to_out(m: MeasurableActionPoint, dept_name: str = "") -> dict:
    d = m.model_dump()
    try:
        d["dependencies"] = json.loads(m.dependencies)
    except Exception:
        d["dependencies"] = []
    try:
        d["acceptance_criteria"] = json.loads(m.acceptance_criteria)
    except Exception:
        d["acceptance_criteria"] = []
    d["department_name"] = dept_name
    return d


@router.get("", response_model=List[dict])
def list_maps(
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    priority: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(MeasurableActionPoint).where(col(MeasurableActionPoint.deleted_at).is_(None))
    if status:
        query = query.where(MeasurableActionPoint.status == status)
    if department_id:
        query = query.where(MeasurableActionPoint.department_id == department_id)
    if priority:
        query = query.where(MeasurableActionPoint.priority == priority)
    maps = session.exec(query.order_by(col(MeasurableActionPoint.created_at).desc())).all()

    dept_map = {d.id: d.name for d in session.exec(select(Department)).all()}
    return [_map_to_out(m, dept_map.get(m.department_id, "")) for m in maps]


@router.get("/{map_id}", response_model=dict)
def get_map(
    map_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    m = session.get(MeasurableActionPoint, map_id)
    if not m or m.deleted_at:
        raise HTTPException(status_code=404, detail="MAP not found")
    dept = session.get(Department, m.department_id)
    return _map_to_out(m, dept.name if dept else "")


@router.patch("/{map_id}/status", response_model=dict)
def update_status(
    map_id: int,
    body: MAPStatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    m = session.get(MeasurableActionPoint, map_id)
    if not m:
        raise HTTPException(status_code=404, detail="MAP not found")

    valid_transitions = {
        "pending": ["assigned", "in_progress"],
        "assigned": ["in_progress"],
        "in_progress": ["submitted"],
        "submitted": ["validated", "in_progress"],
        "validated": ["completed"],
        "completed": [],
    }
    allowed = valid_transitions.get(m.status, [])
    if body.status not in allowed and body.status != m.status:
        raise HTTPException(status_code=400, detail=f"Cannot transition from {m.status} to {body.status}")

    m.status = body.status
    if body.status == "completed":
        m.completed_at = datetime.utcnow()

    session.add(m)
    log = AuditLog(
        user_id=current_user.id,
        action="update_map_status",
        entity_type="map",
        entity_id=map_id,
        details=json.dumps({"new_status": body.status, "notes": body.notes}),
    )
    session.add(log)
    session.commit()
    dept = session.get(Department, m.department_id)
    return _map_to_out(m, dept.name if dept else "")


@router.post("/{map_id}/assign", response_model=dict)
def assign_map(
    map_id: int,
    body: MAPAssignRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    m = session.get(MeasurableActionPoint, map_id)
    if not m:
        raise HTTPException(status_code=404, detail="MAP not found")
    dept = session.get(Department, body.department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    m.department_id = body.department_id
    m.status = "assigned"
    m.assigned_at = datetime.utcnow()
    session.add(m)

    assignment = Assignment(
        map_id=map_id,
        department_id=body.department_id,
        assigned_by_user_id=current_user.id,
        notes=body.notes,
        is_auto_assigned=False,
    )
    session.add(assignment)

    log = AuditLog(
        user_id=current_user.id,
        action="assign_map",
        entity_type="map",
        entity_id=map_id,
        details=json.dumps({"department_id": body.department_id, "notes": body.notes}),
    )
    session.add(log)
    session.commit()
    return _map_to_out(m, dept.name)


@router.post("/{map_id}/submit-evidence", response_model=dict)
def submit_evidence(
    map_id: int,
    body: EvidenceSubmitRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    m = session.get(MeasurableActionPoint, map_id)
    if not m:
        raise HTTPException(status_code=404, detail="MAP not found")

    ev = Evidence(
        map_id=map_id,
        filename=body.filename,
        file_path=f"/uploads/{map_id}/{body.filename}",
        evidence_type=body.evidence_type,
        description=body.description,
        uploaded_by_user_id=current_user.id,
    )
    session.add(ev)

    if m.status in ("assigned", "in_progress", "pending"):
        m.status = "submitted"
        session.add(m)

    log = AuditLog(
        user_id=current_user.id,
        action="submit_evidence",
        entity_type="map",
        entity_id=map_id,
        details=json.dumps({"filename": body.filename, "evidence_type": body.evidence_type}),
    )
    session.add(log)
    session.commit()

    return {"id": ev.id, "map_id": map_id, "filename": body.filename, "evidence_type": body.evidence_type}


@router.post("/{map_id}/trigger-validation", response_model=dict)
def trigger_validation(
    map_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from app.tasks.agent_tasks import run_validation
    m = session.get(MeasurableActionPoint, map_id)
    if not m:
        raise HTTPException(status_code=404, detail="MAP not found")

    task = run_validation.delay(map_id)

    log = AuditLog(
        user_id=current_user.id,
        action="trigger_validation",
        entity_type="map",
        entity_id=map_id,
        details=json.dumps({"task_id": task.id}),
    )
    session.add(log)
    session.commit()

    return {"task_id": task.id, "map_id": map_id, "status": "queued"}


router2 = APIRouter(prefix="/api/obligations", tags=["obligations"])


@router2.post("/{obligation_id}/generate-map", response_model=dict)
def generate_map(
    obligation_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    ob = session.get(Obligation, obligation_id)
    if not ob:
        raise HTTPException(status_code=404, detail="Obligation not found")

    agent = MAPGeneratorAgent(session)
    result = agent.run({
        "obligation": {
            "title": ob.title,
            "description": ob.description,
            "priority": ob.priority,
            "obligation_type": ob.obligation_type,
        }
    })

    dept_code = result.get("department_code", "compliance")
    dept = session.exec(select(Department).where(Department.code == dept_code)).first()
    if not dept:
        dept = session.exec(select(Department)).first()

    deps = result.get("dependencies", [])
    criteria = result.get("acceptance_criteria", [])

    m = MeasurableActionPoint(
        obligation_id=obligation_id,
        title=result["title"],
        description=result["description"],
        department_id=dept.id,
        priority=ob.priority,
        effort_estimate=result.get("effort_estimate", "3-5 days"),
        dependencies=json.dumps(deps),
        acceptance_criteria=json.dumps(criteria),
        evidence_requirement=result.get("evidence_requirement", ""),
        deadline=ob.deadline,
        status="pending",
    )
    session.add(m)
    session.commit()
    session.refresh(m)

    log = AuditLog(
        user_id=current_user.id,
        action="generate_map",
        entity_type="obligation",
        entity_id=obligation_id,
        details=json.dumps({"map_id": m.id}),
    )
    session.add(log)
    session.commit()

    return _map_to_out(m, dept.name if dept else "")
