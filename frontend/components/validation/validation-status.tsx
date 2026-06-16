"use client";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ValidationEvent } from "@/types";
import { fmtDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ICONS = {
  PASS: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  FAIL: <XCircle className="h-4 w-4 text-red-500" />,
  NEEDS_REVIEW: <AlertCircle className="h-4 w-4 text-amber-500" />,
};

const BG: Record<string, string> = {
  PASS: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950",
  FAIL: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
  NEEDS_REVIEW: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
};

export function ValidationCard({ event }: { event: ValidationEvent }) {
  return (
    <div className={cn("rounded-lg border p-4", BG[event.result])}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ICONS[event.result]}
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{event.validator_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(event.validated_at)}</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            {(event.score * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      {event.notes && (
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">{event.notes}</p>
      )}
    </div>
  );
}

export function ValidationSummary({ events }: { events: ValidationEvent[] }) {
  if (!events.length) return null;
  const pass = events.filter((e) => e.result === "PASS").length;
  const total = events.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Validators: {pass}/{total} passed</span>
        <span>Avg score: {((events.reduce((s, e) => s + e.score, 0) / total) * 100).toFixed(0)}%</span>
      </div>
      {events.map((e) => (
        <ValidationCard key={e.id} event={e} />
      ))}
    </div>
  );
}
