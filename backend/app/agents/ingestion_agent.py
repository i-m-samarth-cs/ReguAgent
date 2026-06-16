from app.agents.base import BaseAgent

TOPIC_MAP = {
    "RBI": ["monetary_policy", "banking_regulation", "kyc_aml", "credit_risk", "liquidity"],
    "SEBI": ["securities", "mutual_funds", "market_regulation", "investor_protection", "insider_trading"],
    "IRDAI": ["insurance", "actuarial", "solvency", "policyholder_protection"],
    "DPDP": ["data_privacy", "consent_management", "data_localisation", "breach_notification"],
    "PMMC": ["payment_systems", "fraud_prevention", "settlement", "interoperability"],
}

RISK_KEYWORDS = {
    "critical": ["immediately", "mandatory", "penalty", "criminal", "suspension"],
    "high": ["deadline", "compliance", "must", "shall", "required"],
    "medium": ["should", "recommended", "guideline", "advisory"],
    "low": ["may", "encouraged", "best practice", "optional"],
}


class IngestionAgent(BaseAgent):
    name = "IngestionAgent"
    prompt_file = "ingestion_agent.md"

    def run_mock(self, input_data: dict) -> dict:
        source = input_data.get("source", "RBI")
        content = input_data.get("content", "")
        content_lower = content.lower()

        topics = TOPIC_MAP.get(source, ["regulation", "compliance"])

        risk_level = "medium"
        for level, keywords in RISK_KEYWORDS.items():
            if any(kw in content_lower for kw in keywords):
                risk_level = level
                break

        summary_sentences = [s.strip() for s in content.split(".") if len(s.strip()) > 40][:2]
        summary = ". ".join(summary_sentences) + "." if summary_sentences else content[:200]

        return {
            "topics": topics[:3],
            "risk_level": risk_level,
            "summary": summary,
            "classification": source,
        }
