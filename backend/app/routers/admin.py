import json
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col
from app.database import get_session
from app.models import (
    RegulatoryDocument,
    Obligation,
    MeasurableActionPoint,
    Department,
    PromptTrace,
)
from app.auth.dependencies import get_current_user, require_role
from app.models import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/metrics", response_model=dict)
def admin_metrics(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    docs = session.exec(select(RegulatoryDocument).where(col(RegulatoryDocument.deleted_at).is_(None))).all()
    obligations = session.exec(select(Obligation)).all()
    maps = session.exec(select(MeasurableActionPoint).where(col(MeasurableActionPoint.deleted_at).is_(None))).all()
    departments = session.exec(select(Department).where(Department.is_active == True)).all()

    total = len(maps)
    pending = sum(1 for m in maps if m.status == "pending")
    validated = sum(1 for m in maps if m.status == "validated")
    completed = sum(1 for m in maps if m.status == "completed")
    overdue = sum(1 for m in maps if m.deadline and m.deadline < date.today() and m.status not in ("completed", "validated"))

    compliance_score = round((validated + completed) / max(total, 1) * 100, 1)
    risk_score = round(overdue / max(total, 1) * 100, 1)

    maps_by_dept = []
    for dept in departments:
        dept_maps = [m for m in maps if m.department_id == dept.id]
        maps_by_dept.append({
            "department": dept.name,
            "total": len(dept_maps),
            "completed": sum(1 for m in dept_maps if m.status in ("completed", "validated")),
            "overdue": sum(1 for m in dept_maps if m.deadline and m.deadline < date.today() and m.status not in ("completed", "validated")),
        })

    status_counts = {}
    for m in maps:
        status_counts[m.status] = status_counts.get(m.status, 0) + 1
    maps_by_status = [{"status": k, "count": v} for k, v in status_counts.items()]

    trend_data = []
    today = date.today()
    for i in range(7, -1, -1):
        day = today - timedelta(days=i * 7)
        completed_by_day = sum(1 for m in maps if m.created_at.date() <= day and m.status in ("completed", "validated"))
        total_by_day = sum(1 for m in maps if m.created_at.date() <= day)
        trend_data.append({
            "week": day.strftime("%b %d"),
            "compliance": round(completed_by_day / max(total_by_day, 1) * 100, 1),
            "total_maps": total_by_day,
        })

    return {
        "total_documents": len(docs),
        "total_obligations": len(obligations),
        "total_maps": total,
        "pending_maps": pending,
        "validated_maps": validated,
        "completed_maps": completed,
        "overdue_maps": overdue,
        "overall_compliance_score": compliance_score,
        "overall_risk_score": risk_score,
        "maps_by_department": maps_by_dept,
        "maps_by_status": maps_by_status,
        "trend_data": trend_data,
    }


@router.get("/prompt-traces", response_model=list)
def prompt_traces(
    limit: int = 50,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    traces = session.exec(
        select(PromptTrace).order_by(col(PromptTrace.created_at).desc()).limit(limit)
    ).all()
    result = []
    for t in traces:
        d = t.model_dump()
        try:
            d["input_data"] = json.loads(t.input_data)
        except Exception:
            d["input_data"] = {}
        try:
            d["output_data"] = json.loads(t.output_data)
        except Exception:
            d["output_data"] = {}
        result.append(d)
    return result
