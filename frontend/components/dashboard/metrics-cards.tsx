"use client";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "flat";
  accent?: string;
}

export function MetricCard({ label, value, sub, trend, accent = "text-brand-600" }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn("mt-1.5 text-3xl font-bold tabular-nums", accent)}>{value}</p>
      {sub && (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
          {trend === "flat" && <Minus className="h-3 w-3 text-slate-400" />}
          {sub}
        </p>
      )}
    </div>
  );
}
