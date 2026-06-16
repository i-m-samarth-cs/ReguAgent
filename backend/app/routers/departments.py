import json
from datetime import date
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col, func
from typing import List
from app.database import get_session
from app.models import Department, MeasurableActionPoint
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("", response_model=List[dict])
def list_departments(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    depts = session.exec(select(Department).where(Department.is_active == True)).all()
    return [d.model_dump() for d in depts]


@router.get("/{dept_id}/maps", response_model=List[dict])
def dept_maps(
    dept_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    maps = session.exec(
        select(MeasurableActionPoint)
        .where(MeasurableActionPoint.department_id == dept_id)
        .where(col(MeasurableActionPoint.deleted_at).is_(None))
        .order_by(col(MeasurableActionPoint.created_at).desc())
    ).all()
    result = []
    for m in maps:
        d = m.model_dump()
        try:
            d["dependencies"] = json.loads(m.dependencies)
        except Exception:
            d["dependencies"] = []
        try:
            d["acceptance_criteria"] = json.loads(m.acceptance_criteria)
        except Exception:
            d["acceptance_criteria"] = []
        result.append(d)
    return result


@router.get("/{dept_id}/metrics", response_model=dict)
def dept_metrics(
    dept_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    dept = session.get(Department, dept_id)
    if not dept:
        return {}

    maps = session.exec(
        select(MeasurableActionPoint)
        .where(MeasurableActionPoint.department_id == dept_id)
        .where(col(MeasurableActionPoint.deleted_at).is_(None))
    ).all()

    total = len(maps)
    completed = sum(1 for m in maps if m.status == "completed")
    validated = sum(1 for m in maps if m.status == "validated")
    in_progress = sum(1 for m in maps if m.status == "in_progress")
    overdue = sum(1 for m in maps if m.deadline and m.deadline < date.today() and m.status not in ("completed", "validated"))

    compliance_score = round((completed + validated) / max(total, 1) * 100, 1)
    risk_score = round(overdue / max(total, 1) * 100, 1)

    return {
        "department_id": dept_id,
        "department_name": dept.name,
        "total_maps": total,
        "completed_maps": completed + validated,
        "overdue_maps": overdue,
        "in_progress_maps": in_progress,
        "compliance_score": compliance_score,
        "risk_score": risk_score,
        "status_breakdown": {
            "pending": sum(1 for m in maps if m.status == "pending"),
            "assigned": sum(1 for m in maps if m.status == "assigned"),
            "in_progress": in_progress,
            "submitted": sum(1 for m in maps if m.status == "submitted"),
            "validated": validated,
            "completed": completed,
        },
    }
