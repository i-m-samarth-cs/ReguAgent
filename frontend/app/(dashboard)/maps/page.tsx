"use client";
import { useEffect, useState } from "react";
import { getMaps, getDepartments } from "@/lib/api";
import { getAuthUser, AuthUser } from "@/lib/auth";
import { MAP, Department } from "@/types";
import { MAPCard } from "@/components/maps/map-card";
import { RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSES = ["", "pending", "assigned", "in_progress", "submitted", "validated", "completed"];
const PRIORITIES = ["", "critical", "high", "medium", "low"];

export default function MapsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [maps, setMaps] = useState<MAP[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [deptId, setDeptId] = useState("");

  const fetchMaps = (s = status, p = priority, d = deptId) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (s) params.status = s;
    if (p) params.priority = p;
    if (d) params.department_id = d;
    getMaps(params)
      .then(setMaps)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error);
    getAuthUser().then((currUser) => {
      setUser(currUser);
      if (currUser && currUser.role === "department_lead" && currUser.department_id) {
        const dId = currUser.department_id.toString();
        setDeptId(dId);
        fetchMaps(status, priority, dId);
      } else {
        fetchMaps();
      }
    });
  }, []);

  const handleFilter = () => fetchMaps(status, priority, deptId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{maps.length} action points</p>
        <Button variant="outline" size="sm" onClick={() => fetchMaps(status, priority, deptId)}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All Statuses"}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p ? p : "All Priorities"}</option>
          ))}
        </select>
        <select
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          disabled={user?.role === "department_lead"}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <Button size="sm" onClick={handleFilter}>Apply</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : maps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400 dark:border-slate-700">
          No MAPs found. Generate MAPs from regulatory obligations.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {maps.map((map) => (
            <MAPCard key={map.id} map={map} />
          ))}
        </div>
      )}
    </div>
  );
}
