import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtDate(d: string | Date | null | undefined, fmt = "dd MMM yyyy") {
  if (!d) return "—";
  try {
    const date = typeof d === "string" ? parseISO(d) : d;
    return format(date, fmt);
  } catch {
    return String(d);
  }
}

export function fmtRelative(d: string | Date | null | undefined) {
  if (!d) return "—";
  try {
    const date = typeof d === "string" ? parseISO(d) : d;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return String(d);
  }
}

export function isOverdue(deadline: string | null | undefined, status: string) {
  if (!deadline || ["completed", "validated"].includes(status)) return false;
  return new Date(deadline) < new Date();
}

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  assigned: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  submitted: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  validated: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  completed: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  critical: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  critical: "text-red-600 dark:text-red-400",
};

export const SOURCE_COLORS: Record<string, string> = {
  RBI: "bg-blue-600",
  SEBI: "bg-indigo-600",
  IRDAI: "bg-emerald-600",
  DPDP: "bg-purple-600",
  PMMC: "bg-orange-600",
};

export const VALIDATION_COLORS: Record<string, string> = {
  PASS: "text-emerald-600 dark:text-emerald-400",
  FAIL: "text-red-600 dark:text-red-400",
  NEEDS_REVIEW: "text-amber-600 dark:text-amber-400",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  submitted: "Submitted",
  validated: "Validated",
  completed: "Completed",
};
