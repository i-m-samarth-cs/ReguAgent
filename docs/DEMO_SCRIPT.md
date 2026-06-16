# ReguAgent — 3-Minute Demo Script

## Setup
1. `docker-compose up` (wait ~30s for seed data)
2. Open `http://localhost:3000`

---

## Act 1: Landing & Login (30 seconds)

**Show the landing page.**
> "ReguAgent monitors regulations from RBI, SEBI, IRDAI, the DPDP Act, and PMMC — and converts them into trackable action points automatically."

Point to the **Agentic Pipeline** diagram on the landing page.

**Click "Launch Demo"** → Login page appears.

**Click the "Compliance Officer" quick-fill button** → email pre-fills.

**Click Sign in.**

---

## Act 2: Dashboard Overview (30 seconds)

Dashboard loads immediately with pre-seeded data.

Point to KPI cards:
> "At a glance — overall compliance score, active MAPs, overdue items, and risk score."

Point to the **compliance trend chart**:
> "This shows the compliance trajectory over 8 weeks — as MAPs get validated, the score trends up."

Point to the **department workload bar chart**:
> "Four departments: Compliance, Risk, Legal, and Technology. Each bar shows total vs completed vs overdue."

Point to the **overdue alert banner**:
> "Any overdue items surface immediately. The system flags them before regulators do."

---

## Act 3: Regulatory Feed → Obligation Extraction (45 seconds)

Click **Regulatory Feed** in the sidebar.

Show the 5 pre-seeded regulatory updates:
> "The system ingests circulars from multiple regulators. Each card shows source, risk level, topic tags, and ingestion date."

Click the **DPDP Act** card.

Show the document detail page:
> "Full circular text, extracted summary, and below — the obligations the AI has already extracted."

Point to obligations list:
> "The Obligation Agent has identified 3 distinct obligations from this circular: consent management, DPO appointment, and 72-hour breach notification."

Click **"Generate MAP"** on the "Implement consent management framework" obligation:
> "One click — the MAP Generator Agent converts this obligation into a structured action point with acceptance criteria, evidence requirements, and effort estimate."

The page redirects to the MAPs list.

---

## Act 4: MAP Detail → Evidence & Validation (45 seconds)

Click into any **in_progress** MAP (e.g. the Video-KYC MAP).

Show the MAP detail:
> "Each MAP has its owner department, deadline, acceptance criteria, and evidence requirements pre-populated by the agent."

Scroll to the **Submit Evidence** section.

Type: `"Video-KYC integration test report and vendor certificate uploaded"` → select type `document` → click **Submit**.

The MAP status updates to `submitted`.

Click **"Run Validation"**:
> "This triggers four validation agents asynchronously via Celery — documentation, code change, policy update, and test coverage validators."

Wait 1-2 seconds. Validation results appear:
> "Each agent returns PASS, FAIL, or NEEDS REVIEW with a score and detailed checks. The system aggregates results and updates the MAP status."

---

## Act 5: Reports → Export (30 seconds)

Click **Reports** in the sidebar.

Show the executive summary panel:
> "Board-ready compliance summary — risk level rating, overall compliance percentage, overdue count, and upcoming 30-day deadlines."

Scroll to **Department Breakdown** table:
> "Each department's compliance health, with visual progress bars."

Scroll to **High Risk Items**:
> "Critical and high priority items that are still open — sorted by overdue status."

Click **Export JSON**:
> "Export for integration into your GRC platform, board pack PDF generator, or BI tool."

---

## Act 6: Audit Trail (15 seconds)

Click **Audit Trail** in the sidebar.

> "Every action in the system — ingestion, extraction, MAP generation, evidence submission, validation — is logged with user, timestamp, and payload. Full provenance from regulatory source to validated outcome."

---

## Closing

> "ReguAgent eliminates the gap between a regulatory circular landing in your inbox and a validated, auditable compliance record. The agents handle extraction, assignment, and validation — your teams focus on execution."
