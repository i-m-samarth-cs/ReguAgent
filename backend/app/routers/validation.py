import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col
from typing import List
from app.database import get_session
from app.models import ValidationEvent
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/api/validation-results", tags=["validation"])


@router.get("/{map_id}", response_model=List[dict])
def get_validation_results(
    map_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    events = session.exec(
        select(ValidationEvent)
        .where(ValidationEvent.map_id == map_id)
        .order_by(col(ValidationEvent.validated_at).desc())
    ).all()
    result = []
    for e in events:
        d = e.model_dump()
        try:
            d["details"] = json.loads(e.details)
        except Exception:
            d["details"] = {}
        result.append(d)
    return result
