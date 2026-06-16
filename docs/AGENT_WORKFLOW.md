# Agent Workflow Documentation

## Agent Overview

ReguAgent uses 5 categories of agents, each with a specific role in the compliance pipeline.

---

## 1. IngestionAgent

**File**: `backend/app/agents/ingestion_agent.py`  
**Prompt**: `prompts/ingestion_agent.md`  
**Trigger**: `POST /api/regulatory/ingest`

**Input**:
```json
{
  "source": "RBI",
  "content": "Full text of regulatory document..."
}
```

**Output**:
```json
{
  "topics": ["kyc_aml", "banking_regulation"],
  "risk_level": "high",
  "summary": "Two-sentence summary...",
  "classification": "RBI"
}
```

**Mock behavior**: Uses keyword matching on source and content to classify topics and risk level.

---

## 2. ObligationAgent

**File**: `backend/app/agents/obligation_agent.py`  
**Prompt**: `prompts/obligation_extraction.md`  
**Trigger**: `POST /api/regulatory/{id}/extract-obligations`

**Input**:
```json
{
  "source": "RBI",
  "content": "Full document text...",
  "document_id": 1
}
```

**Output**:
```json
{
  "obligations": [
    {
      "title": "Implement Video-KYC",
      "description": "...",
      "obligation_type": "operational",
      "affected_entities": ["banks", "nbfc"],
      "deadline_days": 90,
      "priority": "high"
    }
  ]
}
```

**Mock behavior**: Returns pre-built obligation sets per regulatory source.

---

## 3. MAPGeneratorAgent

**File**: `backend/app/agents/map_generator_agent.py`  
**Prompt**: `prompts/map_generation.md`  
**Trigger**: `POST /api/obligations/{id}/generate-map`

Converts a single obligation into a full MAP with:
- Acceptance criteria
- Evidence requirements
- Effort estimate
- Department routing
- Dependencies

---

## 4. AssignmentAgent

**File**: `backend/app/agents/assignment_agent.py`  
**Prompt**: `prompts/department_assignment.md`  
**Trigger**: Called internally by MAPGeneratorAgent

Determines the owning department based on obligation keywords and type.

---

## 5. Validation Agents (×4)

**File**: `backend/app/agents/validation_agents.py`  
**Trigger**: `POST /api/maps/{id}/trigger-validation` → Celery task

Runs asynchronously via Celery. Four validators run in sequence:

| Validator | Checks |
|-----------|--------|
| `DocumentationValidator` | Policy doc present, approval trail, sign-off |
| `CodeChangeValidator` | PR linked, code review, tests, deployment |
| `PolicyUpdateValidator` | Policy updated, board approved, staff notified |
| `TestCoverageValidator` | Unit tests, integration tests, coverage ≥ 80% |

Each returns `PASS`, `FAIL`, or `NEEDS_REVIEW` with a score (0-1) and detailed checks.

The Celery task (`run_validation`) aggregates all results and updates MAP status:
- All PASS → `validated`
- No FAIL → `submitted` (stays)
- Any FAIL → no status change (MAP stays in current state for re-review)

---

## Prompt Tracing

Every agent execution is traced in `PromptTrace`:
- Agent name
- Prompt template used
- Input/output JSON
- Model used (mock/gpt-4/claude-3)
- Token count
- Execution time

View traces at `GET /api/admin/prompt-traces`.
