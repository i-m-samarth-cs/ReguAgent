"use client";
import { useEffect, useState } from "react";
import { getRegulatory, ingestDocument } from "@/lib/api";
import { getAuthUser, AuthUser } from "@/lib/auth";
import { RegulatoryDocument } from "@/types";
import { FeedCard } from "@/components/regulatory/feed-card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";

const MOCK_DOCS = [
  {
    source: "RBI",
    title: "RBI Digital Lending Guidelines — Update II",
    reference_number: "RBI/2024-25/DL/002",
    published_date: new Date().toISOString().split("T")[0],
    content: "Reserve Bank of India issues updated guidelines on digital lending operations. Regulated entities must immediately comply with enhanced due diligence requirements for digital loan disbursement. All lending platforms must integrate with Central KYC Registry within 90 days. Mandatory reporting of lending transactions above Rs 10 lakhs on a weekly basis. Entities failing compliance shall face immediate suspension of digital lending licenses.",
    risk_level: "critical",
  },
  {
    source: "SEBI",
    title: "SEBI Cybersecurity Framework for Market Infrastructure",
    reference_number: "SEBI/CYB/2024/122",
    published_date: new Date().toISOString().split("T")[0],
    content: "SEBI mandates all Market Infrastructure Institutions (MIIs) and registered intermediaries to implement comprehensive cybersecurity frameworks. Entities must conduct quarterly vulnerability assessments, implement zero-trust architecture by Q2 2025, and appoint Chief Information Security Officer (CISO) with direct board reporting. Cyber incident reporting to SEBI within 6 hours of detection is mandatory.",
    risk_level: "high",
  },
];

export default function RegulatoryPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [docs, setDocs] = useState<RegulatoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [mockIdx, setMockIdx] = useState(0);

  useEffect(() => {
    getAuthUser().then(setUser);
    fetchDocs();
  }, []);

  const fetchDocs = () => {
    setLoading(true);
    getRegulatory()
      .then(setDocs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleIngest = async () => {
    const mock = MOCK_DOCS[mockIdx % MOCK_DOCS.length];
    setIngesting(true);
    try {
      await ingestDocument(mock);
      setMockIdx((i) => i + 1);
      fetchDocs();
    } catch (e) {
      console.error(e);
    } finally {
      setIngesting(false);
    }
  };

  const sources = [...new Set(docs.map((d) => d.source))];
  const isComplianceOfficer = user?.role === "compliance_officer";

  return (
    <div className="space-y-5">
      {!isComplianceOfficer && user && (
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
          <AlertCircle className="h-4 w-4 text-brand-600 shrink-0" />
          <p className="text-xs">
            <strong>View-Only Feed</strong> — Only the Compliance Officer can upload new circulars and extract action points.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{docs.length} regulatory updates monitored</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocs}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          {isComplianceOfficer && (
            <Button size="sm" onClick={handleIngest} loading={ingesting}>
              <Plus className="h-3.5 w-3.5" />
              Ingest Mock Update
            </Button>
          )}
        </div>
      </div>

      {/* Source filter pills */}
      {sources.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {sources.map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <FeedCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
