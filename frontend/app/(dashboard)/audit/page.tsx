"use client";
import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/api";
import { AuditLog } from "@/types";
import { fmtDate } from "@/lib/utils";
import { RefreshCw, User, FileText, ClipboardList, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTION_ICONS: Record<string, React.ReactNode> = {
  login: <User className="h-3.5 w-3.5 text-blue-500" />,
  ingest_regulatory_document: <FileText className="h-3.5 w-3.5 text-indigo-500" />,
  extract_obligations: <FileText className="h-3.5 w-3.5 text-purple-500" />,
  generate_map: <ClipboardList className="h-3.5 w-3.5 text-amber-500" />,
  assign_map: <ClipboardList className="h-3.5 w-3.5 text-brand-500" />,
  submit_evidence: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />,
  validation_completed: <ShieldCheck className="h-3.5 w-3.5 text-green-500" />,
  update_map_status: <ClipboardList className="h-3.5 w-3.5 text-orange-500" />,
  trigger_validation: <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />,
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = filter
    ? logs.filter((l) => l.action.includes(filter) || l.entity_type.includes(filter))
    : logs;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500">{logs.length} audit events</p>
        <div className="flex gap-2">
          <input
            placeholder="Filter by action or entity..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          />
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-2.5 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                    {fmtDate(log.timestamp, "dd MMM HH:mm")}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {ACTION_ICONS[log.action] || <div className="h-3.5 w-3.5 rounded-full bg-slate-300" />}
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ""}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {log.user_name || "System"}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-400 font-mono max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">No audit logs found.</p>
          )}
        </div>
      )}
    </div>
  );
}
