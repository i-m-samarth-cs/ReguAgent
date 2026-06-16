"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRegulatoryDoc, getRegulatoryObligations, extractObligations, generateMap } from "@/lib/api";
import { RegulatoryDocument, Obligation } from "@/types";
import { SourceBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDate, RISK_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bot, Zap, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegulatoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<RegulatoryDocument | null>(null);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [generatingMap, setGeneratingMap] = useState<number | null>(null);

  useEffect(() => {
    const docId = Number(id);
    Promise.all([getRegulatoryDoc(docId), getRegulatoryObligations(docId)])
      .then(([d, obs]) => {
        setDoc(d);
        setObligations(obs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const obs = await extractObligations(Number(id));
      setObligations((prev) => [...prev, ...obs]);
    } catch (e) {
      console.error(e);
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerateMap = async (obligationId: number) => {
    setGeneratingMap(obligationId);
    try {
      await generateMap(obligationId);
      router.push("/maps");
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingMap(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!doc) return <p className="text-slate-500">Document not found.</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/regulatory" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Feed
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3 flex-wrap">
          <SourceBadge source={doc.source} />
          <span className={cn("flex items-center gap-1 text-sm font-medium capitalize", RISK_COLORS[doc.risk_level])}>
            {doc.risk_level === "critical" && <AlertTriangle className="h-3.5 w-3.5" />}
            {doc.risk_level} risk
          </span>
        </div>
        <h1 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">{doc.title}</h1>
        {doc.reference_number && (
          <p className="mt-0.5 font-mono text-xs text-slate-400">{doc.reference_number}</p>
        )}
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{doc.summary}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Published {fmtDate(doc.published_date)}
          </span>
          <span>Ingested {fmtDate(doc.ingested_at)}</span>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {doc.topic_tags?.map((tag) => (
            <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>

      {doc.content && (
        <Card>
          <CardHeader>
            <CardTitle>Full Text</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{doc.content}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-brand-600" />
              Extracted Obligations ({obligations.length})
            </CardTitle>
            <Button size="sm" onClick={handleExtract} loading={extracting} variant="outline">
              <Bot className="h-3.5 w-3.5" />
              Re-extract with Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {obligations.length === 0 && (
            <p className="text-sm text-slate-500">No obligations extracted yet. Click the button above to run the Obligation Agent.</p>
          )}
          {obligations.map((ob) => (
            <div key={ob.id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {ob.obligation_type.replace(/_/g, " ")}
                    </span>
                    <span className={cn("text-xs font-medium capitalize", RISK_COLORS[ob.priority])}>
                      {ob.priority} priority
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{ob.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ob.description}</p>
                  {ob.deadline && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" /> Deadline: {fmtDate(ob.deadline)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerateMap(ob.id)}
                  loading={generatingMap === ob.id}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Generate MAP
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
