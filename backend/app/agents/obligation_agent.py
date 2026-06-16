import json
from app.agents.base import BaseAgent

MOCK_OBLIGATIONS = {
    "RBI": [
        {
            "title": "Implement enhanced KYC verification for digital onboarding",
            "description": "All regulated entities must implement video-KYC or equivalent digital identity verification for new customer onboarding within the stipulated period.",
            "obligation_type": "operational",
            "affected_entities": ["banks", "nbfc", "payment_aggregators"],
            "deadline_days": 90,
            "priority": "high",
        },
        {
            "title": "Maintain minimum capital adequacy ratio of 12%",
            "description": "Banks must maintain a minimum Capital Adequacy Ratio (CAR) of 12% at all times, with quarterly reporting to RBI.",
            "obligation_type": "risk_management",
            "affected_entities": ["commercial_banks", "small_finance_banks"],
            "deadline_days": 30,
            "priority": "critical",
        },
        {
            "title": "Submit monthly liquidity coverage ratio report",
            "description": "All scheduled commercial banks must submit LCR reports on a monthly basis through the regulatory reporting portal.",
            "obligation_type": "reporting",
            "affected_entities": ["scheduled_commercial_banks"],
            "deadline_days": 15,
            "priority": "high",
        },
    ],
    "SEBI": [
        {
            "title": "Update investor onboarding documentation for mutual funds",
            "description": "AMCs must update their investor onboarding forms to capture ESG risk preferences and update KYC documentation accordingly.",
            "obligation_type": "disclosure",
            "affected_entities": ["amc", "mutual_fund_distributors"],
            "deadline_days": 60,
            "priority": "medium",
        },
        {
            "title": "Implement insider trading monitoring system",
            "description": "Listed companies must implement automated surveillance systems to detect and report potential insider trading activities.",
            "obligation_type": "operational",
            "affected_entities": ["listed_companies", "brokers"],
            "deadline_days": 120,
            "priority": "high",
        },
    ],
    "DPDP": [
        {
            "title": "Establish data principal consent management framework",
            "description": "All data fiduciaries must implement a granular consent management system allowing data principals to grant, withdraw, and manage consents.",
            "obligation_type": "operational",
            "affected_entities": ["all_fintech", "banks", "payment_aggregators"],
            "deadline_days": 180,
            "priority": "critical",
        },
        {
            "title": "Appoint Data Protection Officer",
            "description": "Significant data fiduciaries must appoint a Data Protection Officer (DPO) who is a resident in India and responsible for compliance.",
            "obligation_type": "operational",
            "affected_entities": ["significant_data_fiduciaries"],
            "deadline_days": 90,
            "priority": "high",
        },
        {
            "title": "Implement 72-hour breach notification protocol",
            "description": "Upon discovery of a personal data breach, entities must notify the Data Protection Board and affected data principals within 72 hours.",
            "obligation_type": "reporting",
            "affected_entities": ["all_regulated_entities"],
            "deadline_days": 0,
            "priority": "critical",
        },
    ],
    "IRDAI": [
        {
            "title": "Submit solvency margin report quarterly",
            "description": "All insurance companies must maintain and submit quarterly solvency margin reports demonstrating a minimum solvency ratio of 1.5.",
            "obligation_type": "reporting",
            "affected_entities": ["life_insurers", "general_insurers"],
            "deadline_days": 45,
            "priority": "high",
        },
    ],
    "PMMC": [
        {
            "title": "Implement real-time fraud detection for UPI transactions",
            "description": "Payment system operators must integrate real-time fraud scoring APIs for all UPI transactions above Rs. 5,000.",
            "obligation_type": "operational",
            "affected_entities": ["psp", "banks", "payment_aggregators"],
            "deadline_days": 75,
            "priority": "critical",
        },
    ],
}


class ObligationAgent(BaseAgent):
    name = "ObligationAgent"
    prompt_file = "obligation_extraction.md"

    def run_mock(self, input_data: dict) -> dict:
        source = input_data.get("source", "RBI")
        obligations = MOCK_OBLIGATIONS.get(source, MOCK_OBLIGATIONS["RBI"])
        return {"obligations": obligations[:3]}
