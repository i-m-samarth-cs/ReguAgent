"use client";
import Link from "next/link";
import { ExternalLink, Clock, AlertTriangle } from "lucide-react";
import { RegulatoryDocument } from "@/types";
import { SourceBadge } from "@/components/ui/badge";
import { fmtDate, RISK_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function FeedCard({ doc }: { doc: RegulatoryDocument }) {
  return (
    <Link href={`/regulatory/${doc.id}`}>
      <div className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md hover:border-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-800">
        <div className="flex items-start justify-between gap-3">
          <SourceBadge source={doc.source} />
          <span className={cn("flex items-center gap-1 text-xs font-medium capitalize", RISK_COLORS[doc.risk_level])}>
            {doc.risk_level === "critical" || doc.risk_level === "high" ? (
              <AlertTriangle className="h-3 w-3" />
            ) : null}
            {doc.risk_level} risk
          </span>
        </div>
        <h3 className="mt-2.5 text-sm font-semibold text-slate-900 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400 line-clamp-2">
          {doc.title}
        </h3>
        {doc.reference_number && (
          <p className="mt-0.5 text-xs font-mono text-slate-400 dark:text-slate-500">{doc.reference_number}</p>
        )}
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{doc.summary}</p>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {doc.topic_tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {tag.replace(/_/g, " ")}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            {fmtDate(doc.ingested_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
