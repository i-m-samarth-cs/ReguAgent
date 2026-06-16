from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date


class Department(SQLModel, table=True):
    __tablename__ = "department"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    code: str = Field(unique=True)
    description: str = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(SQLModel, table=True):
    __tablename__ = "user"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    role: str = "reviewer"
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


class RegulatoryDocument(SQLModel, table=True):
    __tablename__ = "regulatorydocument"
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str = Field(index=True)
    title: str
    reference_number: str = ""
    published_date: date
    content: str
    summary: str = ""
    status: str = "active"
    risk_level: str = "medium"
    topic_tags: str = "[]"
    ingested_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


class RegulatorySection(SQLModel, table=True):
    __tablename__ = "regulatorysection"
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="regulatorydocument.id", index=True)
    section_number: str = ""
    title: str = ""
    content: str
    extracted_at: datetime = Field(default_factory=datetime.utcnow)


class Obligation(SQLModel, table=True):
    __tablename__ = "obligation"
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="regulatorydocument.id", index=True)
    section_id: Optional[int] = Field(default=None, foreign_key="regulatorysection.id")
    title: str
    description: str
    obligation_type: str = "operational"
    affected_entities: str = "[]"
    deadline: Optional[date] = None
    priority: str = "medium"
    extracted_by_agent: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MeasurableActionPoint(SQLModel, table=True):
    __tablename__ = "measurableactionpoint"
    id: Optional[int] = Field(default=None, primary_key=True)
    obligation_id: Optional[int] = Field(default=None, foreign_key="obligation.id")
    title: str
    description: str
    department_id: int = Field(foreign_key="department.id", index=True)
    priority: str = "medium"
    effort_estimate: str = ""
    dependencies: str = "[]"
    acceptance_criteria: str = "[]"
    evidence_requirement: str = ""
    deadline: Optional[date] = None
    status: str = "pending"
    assigned_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None


class Assignment(SQLModel, table=True):
    __tablename__ = "assignment"
    id: Optional[int] = Field(default=None, primary_key=True)
    map_id: int = Field(foreign_key="measurableactionpoint.id", index=True)
    department_id: int = Field(foreign_key="department.id")
    assigned_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    notes: str = ""
    is_auto_assigned: bool = True


class Evidence(SQLModel, table=True):
    __tablename__ = "evidence"
    id: Optional[int] = Field(default=None, primary_key=True)
    map_id: int = Field(foreign_key="measurableactionpoint.id", index=True)
    filename: str
    file_path: str
    file_size: int = 0
    evidence_type: str = "document"
    description: str = ""
    uploaded_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class ValidationEvent(SQLModel, table=True):
    __tablename__ = "validationevent"
    id: Optional[int] = Field(default=None, primary_key=True)
    map_id: int = Field(foreign_key="measurableactionpoint.id", index=True)
    validator_name: str
    result: str = "NEEDS_REVIEW"
    score: float = 0.0
    notes: str = ""
    details: str = "{}"
    validated_at: datetime = Field(default_factory=datetime.utcnow)
    task_id: str = ""


class DepartmentComplianceMetric(SQLModel, table=True):
    __tablename__ = "departmentcompliancemetric"
    id: Optional[int] = Field(default=None, primary_key=True)
    department_id: int = Field(foreign_key="department.id", index=True)
    period: str
    total_maps: int = 0
    completed_maps: int = 0
    overdue_maps: int = 0
    compliance_score: float = 0.0
    risk_score: float = 0.0
    calculated_at: datetime = Field(default_factory=datetime.utcnow)


class AuditLog(SQLModel, table=True):
    __tablename__ = "auditlog"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: str = "{}"
    ip_address: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PromptTrace(SQLModel, table=True):
    __tablename__ = "prompttrace"
    id: Optional[int] = Field(default=None, primary_key=True)
    agent_name: str
    prompt_template: str
    input_data: str = "{}"
    output_data: str = "{}"
    model_used: str = "mock"
    tokens_used: int = 0
    execution_time_ms: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
