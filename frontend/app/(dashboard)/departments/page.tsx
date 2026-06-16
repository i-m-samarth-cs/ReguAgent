"use client";
import { useEffect, useState } from "react";
import { getDepartments, getDepartmentMetrics } from "@/lib/api";
import { Department, DeptMetrics } from "@/types";
import Link from "next/link";
import { Building2, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<number, DeptMetrics>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDepartments()
      .then(async (depts) => {
        setDepartments(depts);
        const allMetrics = await Promise.all(depts.map((d: Department) => getDepartmentMetrics(d.id)));
        const mMap: Record<number, DeptMetrics> = {};
        depts.forEach((d: Department, i: number) => {
          mMap[d.id] = allMetrics[i];
        });
        setMetricsMap(mMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {departments.map((dept) => {
        const m = metricsMap[dept.id];
        const compliance = m?.compliance_score || 0;
        const color = compliance > 75 ? "text-emerald-600" : compliance > 50 ? "text-amber-600" : "text-red-600";
        const barColor = compliance > 75 ? "bg-emerald-500" : compliance > 50 ? "bg-amber-500" : "bg-red-500";

        return (
          <Link key={dept.id} href={`/departments/${dept.id}/compliance`}>
            <div className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:border-brand-200 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                    <Building2 className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 dark:text-slate-100">{dept.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{dept.description}</p>
                  </div>
                </div>
                <span className={cn("text-2xl font-bold tabular-nums", color)}>
                  {compliance}%
                </span>
              </div>

              <div className="mt-4">
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full transition-all", barColor)}
                    style={{ width: `${compliance}%` }}
                  />
                </div>
              </div>

              {m && (
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Total", val: m.total_maps },
                    { label: "Done", val: m.completed_maps, color: "text-emerald-600" },
                    { label: "Active", val: m.in_progress_maps, color: "text-amber-600" },
                    { label: "Overdue", val: m.overdue_maps, color: m.overdue_maps > 0 ? "text-red-600" : "text-slate-400" },
                  ].map(({ label, val, color: c }) => (
                    <div key={label}>
                      <p className={cn("text-lg font-bold", c || "text-slate-700 dark:text-slate-200")}>{val}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {m && m.overdue_maps > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  {m.overdue_maps} overdue MAP{m.overdue_maps > 1 ? "s" : ""} require attention
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
