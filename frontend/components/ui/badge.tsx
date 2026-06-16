import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { STATUS_COLORS, PRIORITY_COLORS, VALIDATION_COLORS, STATUS_LABEL } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("capitalize", STATUS_COLORS[status] || "bg-slate-100 text-slate-600")}>
      {STATUS_LABEL[status] || status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge className={cn("capitalize", PRIORITY_COLORS[priority] || "bg-slate-100 text-slate-600")}>
      {priority}
    </Badge>
  );
}

export function ValidationBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    PASS: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    FAIL: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    NEEDS_REVIEW: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <Badge className={colors[result] || "bg-slate-100 text-slate-600"}>
      {result === "NEEDS_REVIEW" ? "Needs Review" : result}
    </Badge>
  );
}

export function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    RBI: "bg-blue-600 text-white",
    SEBI: "bg-indigo-600 text-white",
    IRDAI: "bg-emerald-600 text-white",
    DPDP: "bg-purple-600 text-white",
    PMMC: "bg-orange-600 text-white",
  };
  return <Badge className={cn("font-mono tracking-wide", colors[source] || "bg-slate-600 text-white")}>{source}</Badge>;
}
