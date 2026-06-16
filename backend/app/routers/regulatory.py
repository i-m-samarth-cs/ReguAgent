import json
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col
from app.database import get_session
from app.models import RegulatoryDocument, RegulatorySection, Obligation, AuditLog
from app.schemas.schemas import (
    RegulatoryDocumentOut,
    RegulatoryDocumentDetail,
    RegulatoryIngestRequest,
    ObligationOut,
)
from app.auth.dependencies import get_current_user
from app.models import User
from app.agents.ingestion_agent import IngestionAgent
from app.agents.obligation_agent import ObligationAgent
from typing import List

router = APIRouter(prefix="/api/regulatory", tags=["regulatory"])


def _doc_to_out(doc: RegulatoryDocument) -> dict:
    d = doc.model_dump()
    try:
        d["topic_tags"] = json.loads(doc.topic_tags)
    except Exception:
        d["topic_tags"] = []
    return d


@router.get("", response_model=List[dict])
def list_documents(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    docs = session.exec(
        select(RegulatoryDocument)
        .where(col(RegulatoryDocument.deleted_at).is_(None))
        .order_by(col(RegulatoryDocument.ingested_at).desc())
    ).all()
    return [_doc_to_out(d) for d in docs]


@router.post("/ingest", response_model=dict)
def ingest_document(
    body: RegulatoryIngestRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    agent = IngestionAgent(session)
    result = agent.run({"source": body.source, "content": body.content})

    try:
        pub_date = date.fromisoformat(body.published_date)
    except Exception:
        pub_date = date.today()

    doc = RegulatoryDocument(
        source=body.source,
        title=body.title,
        reference_number=body.reference_number,
        published_date=pub_date,
        content=body.content,
        summary=result.get("summary", ""),
        risk_level=result.get("risk_level", body.risk_level),
        topic_tags=json.dumps(result.get("topics", [])),
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)

    log = AuditLog(
        user_id=current_user.id,
        action="ingest_regulatory_document",
        entity_type="regulatory_document",
        entity_id=doc.id,
        details=json.dumps({"source": body.source, "title": body.title}),
    )
    session.add(log)
    session.commit()

    return _doc_to_out(doc)


@router.get("/{doc_id}", response_model=dict)
def get_document(
    doc_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(RegulatoryDocument, doc_id)
    if not doc or doc.deleted_at:
        raise HTTPException(status_code=404, detail="Document not found")
    return _doc_to_out(doc)


@router.get("/{doc_id}/obligations", response_model=List[dict])
def get_obligations(
    doc_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(RegulatoryDocument, doc_id)
    if not doc or doc.deleted_at:
        raise HTTPException(status_code=404, detail="Document not found")
    obligations = session.exec(
        select(Obligation).where(Obligation.document_id == doc_id)
    ).all()
    result = []
    for o in obligations:
        d = o.model_dump()
        try:
            d["affected_entities"] = json.loads(o.affected_entities)
        except Exception:
            d["affected_entities"] = []
        result.append(d)
    return result


@router.post("/{doc_id}/extract-obligations", response_model=List[dict])
def extract_obligations(
    doc_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(RegulatoryDocument, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    agent = ObligationAgent(session)
    result = agent.run({"source": doc.source, "content": doc.content, "document_id": doc_id})

    created = []
    for raw in result.get("obligations", []):
        deadline = None
        if raw.get("deadline_days", 0) > 0:
            deadline = (date.today() + timedelta(days=raw["deadline_days"]))

        ob = Obligation(
            document_id=doc_id,
            title=raw["title"],
            description=raw["description"],
            obligation_type=raw.get("obligation_type", "operational"),
            affected_entities=json.dumps(raw.get("affected_entities", [])),
            deadline=deadline,
            priority=raw.get("priority", "medium"),
        )
        session.add(ob)
        session.commit()
        session.refresh(ob)
        d = ob.model_dump()
        try:
            d["affected_entities"] = json.loads(ob.affected_entities)
        except Exception:
            d["affected_entities"] = []
        created.append(d)

    log = AuditLog(
        user_id=current_user.id,
        action="extract_obligations",
        entity_type="regulatory_document",
        entity_id=doc_id,
        details=json.dumps({"count": len(created)}),
    )
    session.add(log)
    session.commit()

    return created
