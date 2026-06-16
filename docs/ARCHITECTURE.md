# ReguAgent Architecture

## System Overview

ReguAgent is a full-stack agentic compliance system with a clear separation between:
- **Ingestion & Processing Layer** — regulatory documents flow in, agents extract structure
- **Tracking & Execution Layer** — MAPs are assigned, updated, and evidenced by humans
- **Validation Layer** — agents autonomously verify completion evidence
- **Reporting Layer** — real-time dashboards and compliance summaries

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 14)                    │
│  Landing | Login | Dashboard | Regulatory | MAPs | Departments   │
│                 Audit Trail | Reports                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                            │
│   /api/auth  /api/regulatory  /api/maps  /api/departments        │
│   /api/validation-results  /api/audit-logs  /api/admin           │
└───────────┬──────────────────────────┬──────────────────────────┘
            │ SQLModel/SQLAlchemy       │ Celery Tasks
┌───────────▼──────────────┐ ┌─────────▼──────────────────────────┐
│  PostgreSQL               │ │  Celery Worker + Redis              │
│  - Users / Departments    │ │  - DocumentationValidator           │
│  - RegulatoryDocuments    │ │  - CodeChangeValidator              │
│  - Obligations            │ │  - PolicyUpdateValidator            │
│  - MeasurableActionPoints │ │  - TestCoverageValidator            │
│  - Evidence               │ │                                     │
│  - ValidationEvents       │ │  Triggered via: POST /trigger-val   │
│  - AuditLogs              │ └─────────────────────────────────────┘
│  - PromptTraces           │
└───────────────────────────┘
```

---

## Agent Pipeline

```
Regulatory Document
       │
       ▼
 IngestionAgent          → classifies source, risk, topics
       │
       ▼
 ObligationAgent         → extracts N obligations (structured JSON)
       │
       ▼
 MAPGeneratorAgent       → converts each obligation → 1 MAP
       │
       ▼
 AssignmentAgent         → routes MAP to department
       │
       ▼
 Human Execution         → department team executes + uploads evidence
       │
       ▼
 ValidationAgents (×4)   → DocumentationValidator
                            CodeChangeValidator
                            PolicyUpdateValidator
                            TestCoverageValidator
       │
       ▼
 MAP Status → VALIDATED / COMPLETED
```

---

## Data Flow

1. **Compliance officer** ingests a regulatory document (or mock ingestion via UI)
2. **IngestionAgent** classifies it and extracts summary/topics
3. **ObligationAgent** runs and extracts structured obligations
4. **MAPGeneratorAgent** converts each obligation into a MAP
5. **AssignmentAgent** routes to the appropriate department
6. **Department lead** picks up the MAP, updates status, uploads evidence
7. **Compliance officer** triggers validation
8. **ValidationAgents** run asynchronously via Celery tasks
9. Results update MAP status and appear in dashboard

---

## Database Schema

See `/backend/app/models/models.py` for the full SQLModel schema.

Key relationships:
- `RegulatoryDocument` → `Obligation` (1:N)
- `Obligation` → `MeasurableActionPoint` (1:N)
- `MeasurableActionPoint` → `Evidence` (1:N)
- `MeasurableActionPoint` → `ValidationEvent` (1:N)
- `MeasurableActionPoint` → `Department` (N:1)

---

## AI Mode

- **MOCK** (default): Deterministic outputs based on heuristics. No API keys required.
- **REAL**: Set `AI_MODE=openai` or `AI_MODE=anthropic` with corresponding API keys.

In REAL mode, prompts from `/prompts/*.md` are loaded and sent to the LLM.
All responses are traced in `PromptTrace` for auditability.
