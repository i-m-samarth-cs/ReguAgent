# ReguAgent API Reference

Base URL: `http://localhost:8000`

All endpoints (except `/health` and `/api/auth/login`) require:
```
Authorization: Bearer <token>
```

---

## Auth

### POST /api/auth/login
Login and get JWT token.

**Request:**
```json
{ "email": "compliance@demo.in", "password": "demo1234" }
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "email": "...", "name": "Priya Nair", "role": "compliance_officer", "department_id": 1 }
}
```

### GET /api/auth/me
Returns the currently authenticated user.

---

## Regulatory Documents

### GET /api/regulatory
List all regulatory documents (most recent first).

**Response:** Array of `RegulatoryDocument`

### POST /api/regulatory/ingest
Ingest a new regulatory document and run the IngestionAgent.

**Request:**
```json
{
  "source": "RBI",
  "title": "...",
  "reference_number": "RBI/2024-25/001",
  "published_date": "2024-11-01",
  "content": "Full text...",
  "risk_level": "high"
}
```

### GET /api/regulatory/{id}
Get full document details including content.

### GET /api/regulatory/{id}/obligations
List extracted obligations for a document.

### POST /api/regulatory/{id}/extract-obligations
Run ObligationAgent on a document. Returns newly created obligations.

---

## Measurable Action Points (MAPs)

### GET /api/maps
List all MAPs with optional filters.

**Query params:** `status`, `department_id`, `priority`

### GET /api/maps/{id}
Get MAP details.

### PATCH /api/maps/{id}/status
Update MAP status.

**Request:**
```json
{ "status": "in_progress", "notes": "Work has begun" }
```

**Valid transitions:**
- `pending` → `assigned`, `in_progress`
- `assigned` → `in_progress`
- `in_progress` → `submitted`
- `submitted` → `validated`, `in_progress`
- `validated` → `completed`

### POST /api/maps/{id}/assign
Assign MAP to a department.

**Request:**
```json
{ "department_id": 2, "notes": "Assigned to Risk team" }
```

### POST /api/maps/{id}/submit-evidence
Submit evidence for a MAP.

**Request:**
```json
{
  "evidence_type": "document",
  "description": "Policy document v2.1 approved by board",
  "filename": "policy_v2.1.pdf"
}
```

### POST /api/maps/{id}/trigger-validation
Trigger async Celery validation job. Returns `task_id`.

**Response:**
```json
{ "task_id": "abc-123", "map_id": 5, "status": "queued" }
```

---

## Obligations → MAP Generation

### POST /api/obligations/{id}/generate-map
Generate a MAP from an obligation using MAPGeneratorAgent.

Returns the newly created MAP.

---

## Departments

### GET /api/departments
List all active departments.

### GET /api/departments/{id}/maps
List MAPs belonging to a department.

### GET /api/departments/{id}/metrics
Get compliance metrics for a department.

**Response:**
```json
{
  "department_id": 1,
  "department_name": "Compliance",
  "total_maps": 5,
  "completed_maps": 2,
  "overdue_maps": 1,
  "in_progress_maps": 2,
  "compliance_score": 40.0,
  "risk_score": 20.0,
  "status_breakdown": { "pending": 1, "in_progress": 2, ... }
}
```

---

## Validation Results

### GET /api/validation-results/{map_id}
Get all validation events for a MAP.

---

## Audit Logs

### GET /api/audit-logs
List audit logs (most recent first).

**Query params:** `entity_type`, `limit` (max 500), `offset`

---

## Admin

### GET /api/admin/metrics
Global dashboard metrics.

### GET /api/admin/prompt-traces
List recent agent prompt traces (AI provenance).

---

## Reports

### GET /api/reports/compliance-summary
Generate a full compliance summary report including department breakdown, high-risk items, and upcoming deadlines.

---

## Health

### GET /health
```json
{ "status": "ok", "service": "reguagent-api" }
```
