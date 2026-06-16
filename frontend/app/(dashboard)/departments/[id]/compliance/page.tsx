"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDepartmentMaps, getDepartmentMetrics } from "@/lib/api";
import { MAP, DeptMetrics } from "@/types";
import { MAPCard } from "@/components/maps/map-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export default function DeptCompliancePage() {
  const { id } = useParams();
  const deptId = Number(id);
  const [maps, setMaps] = useState<MAP[]>([]);
  const [metrics, setMetrics] = useState<DeptMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDepartmentMaps(deptId), getDepartmentMetrics(deptId)])
      .then(([m, mt]) => {
        setMaps(m);
        setMetrics(mt);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [deptId]);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div>;
  }

  const compliance = metrics?.compliance_score || 0;
  const barColor = compliance > 75 ? "#22c55e" : compliance > 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-5 max-w-5xl">
      <Link href="/departments" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-3.5 w-3.5" /> All Departments
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
          <Building2 className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{metrics?.department_name}</h1>
          <p className="text-xs text-slate-500">Compliance Health Overview</p>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Compliance Score", val: `${compliance}%`, color: barColor },
            { label: "Total MAPs", val: metrics.total_maps, color: "#3b82f6" },
            { label: "Completed", val: metrics.completed_maps, color: "#22c55e" },
            { label: "Overdue", val: metrics.overdue_maps, color: metrics.overdue_maps > 0 ? "#ef4444" : "#94a3b8" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-2xl font-bold" style={{ color }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status breakdown */}
      {metrics?.status_breakdown && (
        <Card>
          <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(metrics.status_breakdown).map(([status, count]) => (
                count > 0 && (
                  <div key={status} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{count}</p>
                    <p className="text-xs text-slate-400 capitalize">{status.replace(/_/g, " ")}</p>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MAPs */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Action Points ({maps.length})</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {maps.map((map) => (
            <MAPCard key={map.id} map={map} />
          ))}
        </div>
        {maps.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
            No MAPs assigned to this department.
          </div>
        )}
      </div>
    </div>
  );
}
