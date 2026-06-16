"""Seed the database with demo data. Idempotent — skips if already seeded."""
import json
import sys
from datetime import date, datetime, timedelta
from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models import (
    User, Department, RegulatoryDocument, RegulatorySection,
    Obligation, MeasurableActionPoint, Assignment, Evidence,
    ValidationEvent, DepartmentComplianceMetric, AuditLog,
)
from app.auth.jwt import hash_password


def seed(drop_all: bool = True):
    from sqlmodel import SQLModel
    if drop_all:
        print("[seed] Dropping all tables for fresh seed...")
        SQLModel.metadata.drop_all(engine)
        create_db_and_tables()
    with Session(engine) as session:

        print("[seed] Seeding demo data...")

        # --- Departments ---
        dept_compliance = Department(name="Compliance", code="compliance", description="Regulatory compliance and reporting")
        dept_risk = Department(name="Risk Management", code="risk", description="Credit, market, and operational risk")
        dept_legal = Department(name="Legal & Secretarial", code="legal", description="Legal advisory and secretarial functions")
        dept_tech = Department(name="Technology", code="tech", description="IT infrastructure, engineering, and data")
        for d in [dept_compliance, dept_risk, dept_legal, dept_tech]:
            session.add(d)
        session.commit()
        session.refresh(dept_compliance)
        session.refresh(dept_risk)
        session.refresh(dept_legal)
        session.refresh(dept_tech)

        # --- Users ---
        users = [
            User(email="compliance@demo.in", name="Priya Nair", hashed_password=hash_password("demo1234"), role="compliance_officer", department_id=dept_compliance.id),
            User(email="risk@demo.in", name="Arjun Mehta", hashed_password=hash_password("demo1234"), role="risk_manager", department_id=dept_risk.id),
            User(email="legal@demo.in", name="Kavita Sharma", hashed_password=hash_password("demo1234"), role="department_lead", department_id=dept_legal.id),
            User(email="tech@demo.in", name="Rahul Verma", hashed_password=hash_password("demo1234"), role="department_lead", department_id=dept_tech.id),
            User(email="reviewer@demo.in", name="Sunita Reddy", hashed_password=hash_password("demo1234"), role="reviewer"),
        ]
        for u in users:
            session.add(u)
        session.commit()

        # --- Regulatory Documents ---
        today = date.today()
        docs_data = [
            {
                "source": "RBI",
                "title": "Master Direction on KYC (Amendment) — Digital Onboarding",
                "reference_number": "RBI/2024-25/MD-KYC/001",
                "published_date": today - timedelta(days=45),
                "content": """Reserve Bank of India has issued amendments to the Master Direction on Know Your Customer (KYC) norms. All regulated entities must immediately implement enhanced video-KYC verification for digital customer onboarding. Banks and NBFCs shall maintain minimum Capital Adequacy Ratio (CAR) of 12% at all times. Monthly Liquidity Coverage Ratio (LCR) reports shall be submitted through the regulatory reporting portal by the 15th of each subsequent month. Entities failing to comply shall be subject to monetary penalties and regulatory action. The enhanced due diligence requirements are mandatory for all new account openings effective from the date of this circular.""",
                "summary": "Amendment mandating video-KYC for digital onboarding and capital adequacy compliance.",
                "risk_level": "high",
                "topic_tags": json.dumps(["kyc_aml", "banking_regulation", "digital_onboarding"]),
            },
            {
                "source": "SEBI",
                "title": "SEBI (Prohibition of Insider Trading) Amendment Regulations 2024",
                "reference_number": "SEBI/LAD-NRO/GN/2024/187",
                "published_date": today - timedelta(days=30),
                "content": """Securities and Exchange Board of India hereby notifies amendments to insider trading prevention framework. Listed companies must implement automated surveillance systems to detect and report potential insider trading activities within 120 days. AMCs must update investor onboarding documentation to capture ESG risk preferences. All intermediaries shall maintain structured digital compliance registers accessible to SEBI within 48 hours of request. Material non-public information must be reported through the designated electronic system. Non-compliance will attract penalties under SEBI Act 1992.""",
                "summary": "SEBI mandates automated insider trading surveillance and updated investor documentation.",
                "risk_level": "high",
                "topic_tags": json.dumps(["securities", "insider_trading", "investor_protection"]),
            },
            {
                "source": "DPDP",
                "title": "Digital Personal Data Protection Act — Implementation Guidelines",
                "reference_number": "MeitY/DPDP/2024/003",
                "published_date": today - timedelta(days=20),
                "content": """In exercise of powers conferred by the Digital Personal Data Protection Act 2023, the Ministry of Electronics and Information Technology issues these implementation guidelines. All data fiduciaries must implement granular consent management systems by December 2024. Significant data fiduciaries must appoint a Data Protection Officer (DPO) who is a resident of India. Upon discovery of personal data breach, entities must notify the Data Protection Board and affected data principals within 72 hours. Data minimisation principles must be embedded in all new product development. Cross-border data transfer restrictions apply to sensitive personal data categories.""",
                "summary": "DPDP implementation guidelines covering consent management, DPO appointment, and breach notification.",
                "risk_level": "critical",
                "topic_tags": json.dumps(["data_privacy", "consent_management", "breach_notification"]),
            },
            {
                "source": "IRDAI",
                "title": "Insurance Regulatory and Development Authority — Solvency Margin Circular",
                "reference_number": "IRDAI/ACT/CIR/MISC/2024/09",
                "published_date": today - timedelta(days=60),
                "content": """Insurance Regulatory and Development Authority of India directs all insurance companies to maintain a minimum solvency ratio of 1.5 at all times. Quarterly solvency margin reports must be submitted within 45 days of each quarter end. Investment norms for insurance funds have been updated to include green bond allocations. Policyholder protection measures must be enhanced with grievance redressal timelines reduced to 14 days. All insurers must submit actuarial reports signed by a qualified actuary.""",
                "summary": "IRDAI mandates minimum solvency ratio of 1.5 and quarterly reporting requirements.",
                "risk_level": "high",
                "topic_tags": json.dumps(["insurance", "solvency", "actuarial", "reporting"]),
            },
            {
                "source": "PMMC",
                "title": "Payments Regulatory Framework — Fraud Prevention Standards",
                "reference_number": "PMMC/PCI/2024/FPS/011",
                "published_date": today - timedelta(days=10),
                "content": """Payment Management and Monitoring Council mandates implementation of real-time fraud detection for all UPI transactions above Rs. 5,000 within 75 days. Payment system operators must integrate approved fraud scoring APIs. Interoperability standards for cross-border remittances must be implemented by all PSPs. Settlement risk management controls shall be reviewed and updated quarterly. Entities must maintain transaction logs for 5 years and make them available on regulatory request. Failure to meet fraud detection requirements will result in suspension of payment licenses.""",
                "summary": "Mandatory real-time fraud detection for UPI transactions and updated payment framework.",
                "risk_level": "critical",
                "topic_tags": json.dumps(["payment_systems", "fraud_prevention", "upi", "interoperability"]),
            },
        ]

        docs = []
        for dd in docs_data:
            doc = RegulatoryDocument(**dd)
            session.add(doc)
            session.commit()
            session.refresh(doc)
            docs.append(doc)

        # --- Obligations ---
        obligations_data = [
            # RBI doc
            (docs[0].id, "Implement Video-KYC for digital onboarding", "All regulated entities must implement video-KYC or equivalent digital identity verification for all new customer onboarding via digital channels.", "operational", json.dumps(["banks", "nbfc", "payment_aggregators"]), today + timedelta(days=45), "high"),
            (docs[0].id, "Maintain minimum Capital Adequacy Ratio of 12%", "Banks must maintain CAR >= 12% at all times with quarterly reporting to RBI.", "risk_management", json.dumps(["commercial_banks", "small_finance_banks"]), today + timedelta(days=30), "critical"),
            (docs[0].id, "Submit monthly LCR report by 15th", "All scheduled commercial banks must submit LCR reports monthly via the regulatory portal.", "reporting", json.dumps(["scheduled_commercial_banks"]), today + timedelta(days=15), "high"),
            # SEBI doc
            (docs[1].id, "Deploy automated insider trading surveillance system", "Listed companies must implement automated surveillance to detect and report potential insider trading.", "operational", json.dumps(["listed_companies", "brokers"]), today + timedelta(days=90), "high"),
            (docs[1].id, "Update investor onboarding for ESG preferences", "AMCs must update investor forms to capture ESG risk preferences and update KYC documentation.", "operational", json.dumps(["amc", "mutual_fund_distributors"]), today + timedelta(days=60), "medium"),
            # DPDP doc
            (docs[2].id, "Implement consent management framework", "All data fiduciaries must deploy granular consent management systems for data collection and processing.", "operational", json.dumps(["all_fintech", "banks", "payment_aggregators"]), today + timedelta(days=120), "critical"),
            (docs[2].id, "Appoint Data Protection Officer", "Significant data fiduciaries must appoint a resident DPO responsible for DPDP compliance.", "operational", json.dumps(["significant_data_fiduciaries"]), today + timedelta(days=90), "high"),
            (docs[2].id, "Implement 72-hour data breach notification", "Entities must notify Data Protection Board and affected users within 72 hours of breach discovery.", "reporting", json.dumps(["all_regulated_entities"]), None, "critical"),
            # IRDAI doc
            (docs[3].id, "Submit quarterly solvency margin report", "All insurers must submit quarterly solvency reports demonstrating minimum ratio of 1.5.", "reporting", json.dumps(["life_insurers", "general_insurers"]), today + timedelta(days=45), "high"),
            # PMMC doc
            (docs[4].id, "Integrate real-time fraud scoring for UPI", "Payment operators must integrate real-time fraud scoring APIs for all UPI transactions above Rs 5,000.", "operational", json.dumps(["psp", "banks", "payment_aggregators"]), today + timedelta(days=75), "critical"),
            (docs[4].id, "Implement interoperability for cross-border remittances", "All PSPs must implement updated interoperability standards for cross-border remittance processing.", "operational", json.dumps(["psp", "banks"]), today + timedelta(days=60), "medium"),
            (docs[4].id, "Review and update settlement risk controls quarterly", "Quarterly review of settlement risk management controls is mandatory for all payment operators.", "risk_management", json.dumps(["psp", "payment_aggregators"]), today + timedelta(days=30), "medium"),
        ]

        obligations = []
        for od in obligations_data:
            ob = Obligation(
                document_id=od[0], title=od[1], description=od[2],
                obligation_type=od[3], affected_entities=od[4],
                deadline=od[5], priority=od[6],
            )
            session.add(ob)
            session.commit()
            session.refresh(ob)
            obligations.append(ob)

        # --- MAPs ---
        maps_data = [
            # Compliance dept MAPs
            {
                "obligation_id": obligations[0].id,
                "title": "[MAP] Video-KYC Integration for Digital Onboarding",
                "description": "Integrate Video-KYC solution with digital onboarding flow. Validate identity via live face matching and document verification.",
                "department_id": dept_tech.id,
                "priority": "high",
                "effort_estimate": "3-5 days",
                "dependencies": json.dumps(["Video-KYC vendor contract", "IT infrastructure upgrade"]),
                "acceptance_criteria": json.dumps(["Video-KYC covers 100% new digital accounts", "Audit trail for each verification", "Error rate < 2%", "Regulator demo completed"]),
                "evidence_requirement": "Integration test reports, vendor certificate, user acceptance testing sign-off",
                "deadline": today + timedelta(days=40),
                "status": "in_progress",
                "assigned_at": datetime.utcnow() - timedelta(days=5),
            },
            {
                "obligation_id": obligations[1].id,
                "title": "[MAP] Capital Adequacy Monitoring Dashboard",
                "description": "Build real-time CAR monitoring dashboard integrated with CBS. Alert when CAR approaches 12.5% threshold.",
                "department_id": dept_risk.id,
                "priority": "critical",
                "effort_estimate": "1-2 weeks",
                "dependencies": json.dumps(["CBS data feed", "Risk engine API"]),
                "acceptance_criteria": json.dumps(["Real-time CAR visibility", "Automated alerts at 12.5%", "Monthly RBI report generation", "CRO sign-off"]),
                "evidence_requirement": "Dashboard screenshots, alert logs, test data reconciliation report",
                "deadline": today + timedelta(days=25),
                "status": "submitted",
                "assigned_at": datetime.utcnow() - timedelta(days=10),
            },
            {
                "obligation_id": obligations[2].id,
                "title": "[MAP] LCR Automated Monthly Reporting",
                "description": "Automate LCR calculation and report submission to RBI portal by 15th each month.",
                "department_id": dept_compliance.id,
                "priority": "high",
                "effort_estimate": "3-5 days",
                "dependencies": json.dumps(["Treasury data feed", "RBI portal access"]),
                "acceptance_criteria": json.dumps(["Automated submission by 15th", "Zero manual intervention", "Audit trail maintained", "CFO attestation"]),
                "evidence_requirement": "Submission confirmation, reconciliation report, process documentation",
                "deadline": today + timedelta(days=10),
                "status": "validated",
                "assigned_at": datetime.utcnow() - timedelta(days=20),
                "completed_at": datetime.utcnow() - timedelta(days=2),
            },
            {
                "obligation_id": obligations[3].id,
                "title": "[MAP] Insider Trading Surveillance System Deployment",
                "description": "Procure and deploy automated surveillance system for monitoring unusual trading patterns and insider trading signals.",
                "department_id": dept_tech.id,
                "priority": "high",
                "effort_estimate": "1-2 weeks",
                "dependencies": json.dumps(["SEBI system integration", "Legal review of vendor agreement"]),
                "acceptance_criteria": json.dumps(["System covers all listed securities", "Real-time alert generation", "SEBI reporting integration", "30-day parallel run completed"]),
                "evidence_requirement": "System test report, SEBI acknowledgment, parallel run results",
                "deadline": today + timedelta(days=85),
                "status": "assigned",
                "assigned_at": datetime.utcnow() - timedelta(days=3),
            },
            {
                "obligation_id": obligations[4].id,
                "title": "[MAP] ESG Risk Preference Capture in Investor Forms",
                "description": "Update KYC and investor onboarding forms to include ESG preference questionnaire and update digital workflows.",
                "department_id": dept_compliance.id,
                "priority": "medium",
                "effort_estimate": "3-5 days",
                "dependencies": json.dumps(["SEBI ESG taxonomy", "CRM form builder"]),
                "acceptance_criteria": json.dumps(["ESG fields in 100% investor forms", "Data storage mapped", "Legal review cleared", "Staff training done"]),
                "evidence_requirement": "Updated form samples, system screenshot, training records",
                "deadline": today + timedelta(days=55),
                "status": "pending",
            },
            {
                "obligation_id": obligations[5].id,
                "title": "[MAP] Consent Management Platform Implementation",
                "description": "Build or procure a consent management platform enabling granular, auditable user consent for all data processing activities.",
                "department_id": dept_tech.id,
                "priority": "critical",
                "effort_estimate": "1-2 weeks",
                "dependencies": json.dumps(["DPO appointment", "Data mapping exercise"]),
                "acceptance_criteria": json.dumps(["CMP covers all data categories", "Consent withdrawal in < 24hrs", "Audit log for all consent actions", "DPO sign-off", "Legal review complete"]),
                "evidence_requirement": "CMP architecture doc, testing report, DPO attestation, legal memo",
                "deadline": today + timedelta(days=115),
                "status": "in_progress",
                "assigned_at": datetime.utcnow() - timedelta(days=7),
            },
            {
                "obligation_id": obligations[6].id,
                "title": "[MAP] Appoint Data Protection Officer",
                "description": "Identify, screen, and appoint a qualified DPO resident in India. Define charter, responsibilities, and reporting structure.",
                "department_id": dept_legal.id,
                "priority": "high",
                "effort_estimate": "3-5 days",
                "dependencies": json.dumps(["Board approval", "HR recruitment process"]),
                "acceptance_criteria": json.dumps(["DPO formally appointed via board resolution", "DPO charter published", "Contact details registered with DPIB", "Announcement to staff"]),
                "evidence_requirement": "Board resolution, appointment letter, DPIB registration certificate",
                "deadline": today + timedelta(days=85),
                "status": "submitted",
                "assigned_at": datetime.utcnow() - timedelta(days=15),
            },
            {
                "obligation_id": obligations[7].id,
                "title": "[MAP] Data Breach Incident Response Playbook",
                "description": "Develop and operationalize 72-hour breach notification playbook including detection, assessment, notification, and containment.",
                "department_id": dept_tech.id,
                "priority": "critical",
                "effort_estimate": "3-5 days",
                "dependencies": json.dumps(["DPO appointment", "CISO review", "Legal review"]),
                "acceptance_criteria": json.dumps(["Playbook approved by CISO and DPO", "Tabletop exercise completed", "Notification templates ready", "DPIB contact established", "Staff trained"]),
                "evidence_requirement": "Approved playbook, tabletop exercise report, training records",
                "deadline": today + timedelta(days=30),
                "status": "completed",
                "assigned_at": datetime.utcnow() - timedelta(days=25),
                "completed_at": datetime.utcnow() - timedelta(days=5),
            },
            {
                "obligation_id": obligations[8].id,
                "title": "[MAP] Quarterly Solvency Ratio Reporting Automation",
                "description": "Automate quarterly solvency margin calculation and IRDAI report submission workflow.",
                "department_id": dept_risk.id,
                "priority": "high",
                "effort_estimate": "3-5 days",
                "dependencies": json.dumps(["Actuarial system integration", "IRDAI portal access"]),
                "acceptance_criteria": json.dumps(["Automated calculation verified by actuary", "Submission within 45 days of quarter end", "Report format approved by IRDAI", "CFO sign-off"]),
                "evidence_requirement": "Actuary certificate, submission confirmation, reconciliation",
                "deadline": today + timedelta(days=42),
                "status": "in_progress",
                "assigned_at": datetime.utcnow() - timedelta(days=8),
            },
            {
                "obligation_id": obligations[9].id,
                "title": "[MAP] Real-Time UPI Fraud Scoring Integration",
                "description": "Integrate approved fraud scoring API into UPI transaction processing pipeline for transactions > Rs 5,000.",
                "department_id": dept_tech.id,
                "priority": "critical",
                "effort_estimate": "1-2 weeks",
                "dependencies": json.dumps(["Fraud scoring vendor selection", "UPI switch API access", "Performance testing"]),
                "acceptance_criteria": json.dumps(["100% UPI txns > 5K scored", "Latency < 100ms p99", "Fraud detection rate > 95%", "PMMC compliance certificate", "Zero false positives > 0.1%"]),
                "evidence_requirement": "Load test report, fraud detection accuracy report, PMMC certification",
                "deadline": today + timedelta(days=70),
                "status": "assigned",
                "assigned_at": datetime.utcnow() - timedelta(days=2),
            },
            {
                "obligation_id": obligations[10].id,
                "title": "[MAP] Cross-Border Remittance Interoperability Standards",
                "description": "Update payment processing systems to comply with new cross-border remittance interoperability standards.",
                "department_id": dept_tech.id,
                "priority": "medium",
                "effort_estimate": "1-2 weeks",
                "dependencies": json.dumps(["SWIFT integration update", "Correspondent banking agreements"]),
                "acceptance_criteria": json.dumps(["Standards implemented in all corridors", "ISO 20022 messages supported", "Testing with 3 correspondent banks", "RBI/PMMC sign-off"]),
                "evidence_requirement": "Integration test reports, correspondent bank confirmations, regulator acknowledgment",
                "deadline": today + timedelta(days=58),
                "status": "pending",
            },
            {
                "obligation_id": obligations[11].id,
                "title": "[MAP] Quarterly Settlement Risk Review Framework",
                "description": "Establish structured quarterly review process for settlement risk controls with documented risk register and mitigation plans.",
                "department_id": dept_risk.id,
                "priority": "medium",
                "effort_estimate": "1-3 days",
                "dependencies": json.dumps(["Risk management framework", "Quarterly calendar"]),
                "acceptance_criteria": json.dumps(["Review framework documented", "Q1 review completed", "Risk register updated", "Board risk committee briefed"]),
                "evidence_requirement": "Review framework document, Q1 review minutes, risk register",
                "deadline": today + timedelta(days=28),
                "status": "completed",
                "assigned_at": datetime.utcnow() - timedelta(days=30),
                "completed_at": datetime.utcnow() - timedelta(days=8),
            },
        ]

        map_objects = []
        for md in maps_data:
            m = MeasurableActionPoint(**md)
            session.add(m)
            session.commit()
            session.refresh(m)
            map_objects.append(m)

        # --- Assignments ---
        for m in map_objects:
            if m.assigned_at:
                a = Assignment(
                    map_id=m.id,
                    department_id=m.department_id,
                    assigned_at=m.assigned_at,
                    is_auto_assigned=True,
                )
                session.add(a)
        session.commit()

        # --- Evidence ---
        evidence_data = [
            (map_objects[1].id, "cap_adequacy_dashboard.png", "screenshot", "CAR monitoring dashboard screenshot showing 13.2% CAR"),
            (map_objects[1].id, "reconciliation_report.pdf", "document", "Monthly reconciliation report for capital adequacy"),
            (map_objects[2].id, "lcr_submission_q3.pdf", "document", "LCR submission confirmation from RBI portal"),
            (map_objects[2].id, "lcr_automation_doc.pdf", "document", "Technical documentation for LCR automation"),
            (map_objects[6].id, "dpo_appointment_letter.pdf", "document", "Formal appointment letter for DPO"),
            (map_objects[6].id, "board_resolution.pdf", "document", "Board resolution approving DPO appointment"),
            (map_objects[7].id, "breach_playbook_v2.pdf", "document", "Approved data breach incident response playbook"),
            (map_objects[7].id, "tabletop_exercise_report.pdf", "document", "Tabletop exercise results and lessons learned"),
            (map_objects[11].id, "q1_settlement_review.pdf", "document", "Q1 settlement risk review minutes and risk register"),
        ]
        for ev_data in evidence_data:
            ev = Evidence(
                map_id=ev_data[0],
                filename=ev_data[1],
                file_path=f"/uploads/{ev_data[0]}/{ev_data[1]}",
                evidence_type=ev_data[2],
                description=ev_data[3],
            )
            session.add(ev)
        session.commit()

        # --- Validation Events ---
        validation_data = [
            (map_objects[2].id, "DocumentationValidator", "PASS", 0.94, "All documentation complete and approved"),
            (map_objects[2].id, "PolicyUpdateValidator", "PASS", 0.91, "Policy updated and communicated"),
            (map_objects[2].id, "CodeChangeValidator", "PASS", 0.88, "Automation code reviewed and deployed"),
            (map_objects[7].id, "DocumentationValidator", "PASS", 0.96, "Playbook approved by all stakeholders"),
            (map_objects[7].id, "TestCoverageValidator", "PASS", 0.92, "Tabletop exercise successfully completed"),
            (map_objects[11].id, "DocumentationValidator", "PASS", 0.89, "Review framework documented and approved"),
            (map_objects[1].id, "DocumentationValidator", "NEEDS_REVIEW", 0.68, "Awaiting final sign-off on reconciliation report"),
            (map_objects[6].id, "DocumentationValidator", "NEEDS_REVIEW", 0.72, "Board resolution received, DPIB registration pending"),
        ]
        for vd in validation_data:
            ve = ValidationEvent(
                map_id=vd[0],
                validator_name=vd[1],
                result=vd[2],
                score=vd[3],
                notes=vd[4],
                details=json.dumps({"auto_validated": True}),
            )
            session.add(ve)
        session.commit()

        # --- Department Metrics ---
        for dept in [dept_compliance, dept_risk, dept_legal, dept_tech]:
            dept_maps = [m for m in map_objects if m.department_id == dept.id]
            total = len(dept_maps)
            completed = sum(1 for m in dept_maps if m.status in ("completed", "validated"))
            overdue = sum(1 for m in dept_maps if m.deadline and m.deadline < today and m.status not in ("completed", "validated"))
            metric = DepartmentComplianceMetric(
                department_id=dept.id,
                period="2024-Q4",
                total_maps=total,
                completed_maps=completed,
                overdue_maps=overdue,
                compliance_score=round(completed / max(total, 1) * 100, 1),
                risk_score=round(overdue / max(total, 1) * 100, 1),
            )
            session.add(metric)
        session.commit()

        # --- Audit Logs ---
        audit_entries = [
            AuditLog(action="login", entity_type="user", entity_id=1, details=json.dumps({"ip": "10.0.0.1"}), ip_address="10.0.0.1"),
            AuditLog(action="ingest_regulatory_document", entity_type="regulatory_document", entity_id=docs[0].id, details=json.dumps({"source": "RBI"})),
            AuditLog(action="extract_obligations", entity_type="regulatory_document", entity_id=docs[0].id, details=json.dumps({"count": 3})),
            AuditLog(action="generate_map", entity_type="obligation", entity_id=obligations[0].id, details=json.dumps({"map_id": map_objects[0].id})),
            AuditLog(action="assign_map", entity_type="map", entity_id=map_objects[0].id, details=json.dumps({"department": "tech"})),
            AuditLog(action="submit_evidence", entity_type="map", entity_id=map_objects[1].id, details=json.dumps({"filename": "cap_adequacy_dashboard.png"})),
            AuditLog(action="validation_completed", entity_type="map", entity_id=map_objects[2].id, details=json.dumps({"result": "PASS"})),
        ]
        for al in audit_entries:
            session.add(al)
        session.commit()

        print("[seed] Done. Demo credentials:")
        print("  compliance@demo.in / demo1234  (Compliance Officer)")
        print("  risk@demo.in       / demo1234  (Risk Manager)")
        print("  legal@demo.in      / demo1234  (Department Lead - Legal)")
        print("  tech@demo.in       / demo1234  (Department Lead - Tech)")
        print("  reviewer@demo.in   / demo1234  (Reviewer)")


if __name__ == "__main__":
    seed()
