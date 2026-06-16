"use client";
import Link from "next/link";
import { Calendar, Building2, AlertCircle } from "lucide-react";
import { MAP } from "@/types";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";
import { fmtDate, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function MAPCard({ map }: { map: MAP }) {
  const overdue = isOverdue(map.deadline, map.status);

  return (
    <Link href={`/maps/${map.id}`}>
      <div
        className={cn(
          "group rounded-lg border bg-white p-4 transition-all hover:shadow-md dark:bg-slate-900",
          overdue ? "border-red-200 dark:border-red-900" : "border-slate-200 dark:border-slate-700"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={map.status} />
              <PriorityBadge priority={map.priority} />
              {overdue && (
                <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                  <AlertCircle className="h-3 w-3" /> Overdue
                </span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400 line-clamp-2">
              {map.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{map.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {map.department_name}
          </span>
          {map.deadline && (
            <span className={cn("flex items-center gap-1", overdue && "text-red-500 dark:text-red-400")}>
              <Calendar className="h-3.5 w-3.5" />
              Due {fmtDate(map.deadline)}
            </span>
          )}
          {map.effort_estimate && (
            <span className="ml-auto text-slate-400 dark:text-slate-500">{map.effort_estimate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
