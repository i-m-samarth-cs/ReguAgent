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
    ValidationEvent,
)
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/compliance-summary", response_model=dict)
def compliance_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    maps = session.exec(select(MeasurableActionPoint).where(col(MeasurableActionPoint.deleted_at).is_(None))).all()
    departments = session.exec(select(Department).where(Department.is_active == True)).all()
    docs = session.exec(select(RegulatoryDocument).where(col(RegulatoryDocument.deleted_at).is_(None))).all()

    total = len(maps)
    completed = sum(1 for m in maps if m.status in ("completed", "validated"))
    overdue = sum(1 for m in maps if m.deadline and m.deadline < date.today() and m.status not in ("completed", "validated"))
    upcoming = sum(1 for m in maps if m.deadline and date.today() < m.deadline <= date.today() + timedelta(days=30) and m.status not in ("completed", "validated"))

    high_risk = [
        {
            "id": m.id,
            "title": m.title,
            "priority": m.priority,
            "deadline": str(m.deadline) if m.deadline else None,
            "status": m.status,
            "overdue": bool(m.deadline and m.deadline < date.today()),
        }
        for m in maps
        if m.priority in ("high", "critical") and m.status not in ("completed", "validated")
    ]

    dept_breakdown = []
    for dept in departments:
        dept_maps = [m for m in maps if m.department_id == dept.id]
        total_d = len(dept_maps)
        done_d = sum(1 for m in dept_maps if m.status in ("completed", "validated"))
        over_d = sum(1 for m in dept_maps if m.deadline and m.deadline < date.today() and m.status not in ("completed", "validated"))
        dept_breakdown.append({
            "department": dept.name,
            "code": dept.code,
            "total": total_d,
            "completed": done_d,
            "overdue": over_d,
            "compliance_pct": round(done_d / max(total_d, 1) * 100, 1),
        })

    sources_breakdown = {}
    for doc in docs:
        sources_breakdown[doc.source] = sources_breakdown.get(doc.source, 0) + 1

    return {
        "report_date": str(date.today()),
        "executive_summary": {
            "total_active_maps": total,
            "completed_maps": completed,
            "overdue_maps": overdue,
            "upcoming_deadlines_30d": upcoming,
            "overall_compliance_pct": round(completed / max(total, 1) * 100, 1),
            "risk_level": "HIGH" if overdue > 3 else ("MEDIUM" if overdue > 0 else "LOW"),
        },
        "department_breakdown": dept_breakdown,
        "high_risk_items": sorted(high_risk, key=lambda x: (x["overdue"], x["priority"] == "critical"), reverse=True)[:10],
        "regulatory_sources_monitored": sources_breakdown,
        "upcoming_deadlines": [
            {
                "id": m.id,
                "title": m.title,
                "deadline": str(m.deadline),
                "days_remaining": (m.deadline - date.today()).days if m.deadline else None,
                "priority": m.priority,
                "status": m.status,
            }
            for m in sorted(
                [m for m in maps if m.deadline and m.deadline > date.today() and m.status not in ("completed", "validated")],
                key=lambda x: x.deadline
            )[:10]
        ],
    }
