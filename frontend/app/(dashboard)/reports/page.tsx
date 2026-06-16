"use client";
import { useEffect, useState } from "react";
import { getComplianceSummary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Download, RefreshCw, AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplianceSummary()
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${report.report_date}.json`;
    a.click();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div>;
  }

  if (!report) return null;

  const { executive_summary: es, department_breakdown, high_risk_items, upcoming_deadlines, regulatory_sources_monitored } = report;

  const riskColor = es.risk_level === "HIGH" ? "text-red-600" : es.risk_level === "MEDIUM" ? "text-amber-600" : "text-emerald-600";
  const riskBg = es.risk_level === "HIGH" ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900" : es.risk_level === "MEDIUM" ? "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900" : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900";

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-slate-500">Report Date: {fmtDate(report.report_date)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); getComplianceSummary().then(setReport).finally(() => setLoading(false)); }}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" /> Export JSON
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className={cn("rounded-lg border p-5", riskBg)}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Executive Summary</h2>
            <p className="mt-0.5 text-xs text-slate-500">Overall compliance risk assessment</p>
          </div>
          <span className={cn("text-sm font-bold", riskColor)}>Risk Level: {es.risk_level}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Compliance", val: `${es.overall_compliance_pct}%`, icon: <TrendingUp className="h-3.5 w-3.5" />, color: "text-emerald-600" },
            { label: "Total MAPs", val: es.total_active_maps, color: "text-slate-700 dark:text-slate-200" },
            { label: "Completed", val: es.completed_maps, icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-emerald-600" },
            { label: "Overdue", val: es.overdue_maps, icon: <AlertTriangle className="h-3.5 w-3.5" />, color: es.overdue_maps > 0 ? "text-red-600" : "text-slate-400" },
            { label: "Due in 30d", val: es.upcoming_deadlines_30d, icon: <Clock className="h-3.5 w-3.5" />, color: "text-amber-600" },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className="rounded-lg bg-white/60 p-3 dark:bg-slate-900/40">
              <div className={cn("flex items-center gap-1 text-lg font-bold", color)}>
                {icon}{val}
              </div>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader><CardTitle>Department Compliance Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Department</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Total</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Completed</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Overdue</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Compliance %</th>
              </tr>
            </thead>
            <tbody>
              {department_breakdown.map((d: any) => (
                <tr key={d.department} className="border-b border-slate-50 last:border-0 dark:border-slate-800">
                  <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{d.department}</td>
                  <td className="px-5 py-2.5 text-right text-slate-500">{d.total}</td>
                  <td className="px-5 py-2.5 text-right text-emerald-600">{d.completed}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={d.overdue > 0 ? "font-semibold text-red-600" : "text-slate-400"}>{d.overdue}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={cn("h-full rounded-full", d.compliance_pct > 75 ? "bg-emerald-500" : d.compliance_pct > 50 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${d.compliance_pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{d.compliance_pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* High Risk Items */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> High Risk Items</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {high_risk_items.length === 0 && <p className="text-sm text-slate-400">No high risk items.</p>}
            {high_risk_items.map((item: any) => (
              <div key={item.id} className={cn("rounded-md border p-3", item.overdue ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950" : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900")}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{item.title}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", item.priority === "critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                    {item.priority}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span>{item.status}</span>
                  {item.deadline && <span>· Due {fmtDate(item.deadline)}</span>}
                  {item.overdue && <span className="text-red-500 font-medium">· OVERDUE</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Upcoming Deadlines</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcoming_deadlines.length === 0 && <p className="text-sm text-slate-400">No upcoming deadlines.</p>}
            {upcoming_deadlines.map((item: any) => (
              <div key={item.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-amber-600 font-medium">{item.days_remaining}d remaining</span>
                  <span>· {fmtDate(item.deadline)}</span>
                  <span>· {item.priority}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Regulatory Sources */}
      <Card>
        <CardHeader><CardTitle>Regulatory Sources Monitored</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(regulatory_sources_monitored).map(([source, count]) => (
              <div key={source} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xl font-bold text-brand-600">{count as number}</p>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{source}</p>
                <p className="text-xs text-slate-400">circulars</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
