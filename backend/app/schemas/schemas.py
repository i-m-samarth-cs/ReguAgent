from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime, date


# Auth
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    department_id: Optional[int]
    is_active: bool

    class Config:
        from_attributes = True


# Department
class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    description: str
    is_active: bool

    class Config:
        from_attributes = True


# Regulatory
class RegulatoryDocumentOut(BaseModel):
    id: int
    source: str
    title: str
    reference_number: str
    published_date: date
    summary: str
    status: str
    risk_level: str
    topic_tags: List[str]
    ingested_at: datetime

    class Config:
        from_attributes = True


class RegulatoryDocumentDetail(RegulatoryDocumentOut):
    content: str


class RegulatoryIngestRequest(BaseModel):
    source: str
    title: str
    reference_number: str
    published_date: str
    content: str
    risk_level: str = "medium"


class ObligationOut(BaseModel):
    id: int
    document_id: int
    title: str
    description: str
    obligation_type: str
    affected_entities: List[str]
    deadline: Optional[date]
    priority: str
    extracted_by_agent: bool
    created_at: datetime

    class Config:
        from_attributes = True


# MAP
class MAPOut(BaseModel):
    id: int
    obligation_id: Optional[int]
    title: str
    description: str
    department_id: int
    department_name: Optional[str] = None
    priority: str
    effort_estimate: str
    dependencies: List[str]
    acceptance_criteria: List[str]
    evidence_requirement: str
    deadline: Optional[date]
    status: str
    assigned_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class MAPStatusUpdate(BaseModel):
    status: str
    notes: str = ""


class MAPAssignRequest(BaseModel):
    department_id: int
    notes: str = ""


class EvidenceSubmitRequest(BaseModel):
    evidence_type: str
    description: str
    filename: str = "evidence.pdf"


# Evidence
class EvidenceOut(BaseModel):
    id: int
    map_id: int
    filename: str
    evidence_type: str
    description: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


# Validation
class ValidationEventOut(BaseModel):
    id: int
    map_id: int
    validator_name: str
    result: str
    score: float
    notes: str
    details: Any
    validated_at: datetime

    class Config:
        from_attributes = True


# Department Metrics
class DepartmentMetrics(BaseModel):
    department_id: int
    department_name: str
    total_maps: int
    completed_maps: int
    overdue_maps: int
    in_progress_maps: int
    compliance_score: float
    risk_score: float


# Audit
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    entity_type: str
    entity_id: Optional[int]
    details: Any
    timestamp: datetime

    class Config:
        from_attributes = True


# Admin metrics
class AdminMetrics(BaseModel):
    total_documents: int
    total_obligations: int
    total_maps: int
    pending_maps: int
    validated_maps: int
    completed_maps: int
    overdue_maps: int
    overall_compliance_score: float
    overall_risk_score: float
    maps_by_department: List[dict]
    maps_by_status: List[dict]
    trend_data: List[dict]


# Prompt Trace
class PromptTraceOut(BaseModel):
    id: int
    agent_name: str
    prompt_template: str
    input_data: Any
    output_data: Any
    model_used: str
    tokens_used: int
    execution_time_ms: int
    created_at: datetime

    class Config:
        from_attributes = True
