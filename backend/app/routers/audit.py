import json
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, col
from typing import List, Optional
from app.database import get_session
from app.models import AuditLog, User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/audit-logs", tags=["audit"])


@router.get("", response_model=List[dict])
def list_audit_logs(
    entity_type: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(AuditLog)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    logs = session.exec(
        query.order_by(col(AuditLog.timestamp).desc()).limit(limit).offset(offset)
    ).all()

    user_ids = list({lg.user_id for lg in logs if lg.user_id})
    users = {u.id: u.name for u in session.exec(select(User).where(col(User.id).in_(user_ids))).all()}

    result = []
    for lg in logs:
        d = lg.model_dump()
        try:
            d["details"] = json.loads(lg.details)
        except Exception:
            d["details"] = {}
        d["user_name"] = users.get(lg.user_id, "System")
        result.append(d)
    return result
