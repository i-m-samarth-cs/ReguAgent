"use client";
import { useEffect, useState } from "react";
import { getAdminMetrics, getDepartmentMetrics, getDepartmentMaps, getMaps, triggerValidation, updateMapStatus } from "@/lib/api";
import { getAuthUser, AuthUser } from "@/lib/auth";
import { AdminMetrics, MAP } from "@/types";
import { MetricCard } from "@/components/dashboard/metrics-cards";
import { ComplianceTrendChart, DeptBarChart, StatusPieChart } from "@/components/dashboard/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Award, Shield, FileText, CheckCircle2, ChevronRight, Play, Check, X, RefreshCw } from "lucide-react";
import { PointsChart } from "@/components/ui/points-chart";
import Link from "next/link";

const WELCOME_BANNER_DATA: Record<
  string,
  {
    title: string;
    sub: string;
    gradient: string;
  }
> = {
  compliance_officer: {
    title: "Compliance Management Hub 🏛️",
    sub: "Overseeing all organizational compliance initiatives, policy updates, and audit trails.",
    gradient: "from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-950 dark:via-blue-900 dark:to-cyan-800 text-white",
  },
  risk_manager: {
    title: "Risk Control Dashboard 🛡️",
    sub: "Tracking key risk indicators, solvency status, and high-impact compliance gaps.",
    gradient: "from-amber-600 via-orange-600 to-red-500 dark:from-amber-950 dark:via-orange-900 dark:to-red-950 text-white",
  },
  reviewer: {
    title: "Validation Operations Center 🔍",
    sub: "Reviewing evidence submissions and executing policy validator scripts.",
    gradient: "from-slate-700 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 text-white",
  },
};

function getBannerConfig(user: AuthUser | null) {
  if (!user) return { title: "Welcome to ReguAgent", sub: "Compliance Intelligence Hub", gradient: "from-indigo-600 to-blue-500 text-white" };
  if (user.role === "department_lead") {
    if (user.email === "tech@demo.in") {
      return {
        title: "Technology Operations Workspace 💻",
        sub: `Lead: ${user.name} | Infrastructure, zero-trust policies, and API integrations.`,
        gradient: "from-teal-600 via-emerald-600 to-green-500 dark:from-teal-950 dark:via-emerald-900 dark:to-green-950 text-white",
      };
    } else {
      return {
        title: "Legal & Secretarial Workspace ⚖️",
        sub: `Lead: ${user.name} | Corporate governance, secretarial compliance, and DPO supervision.`,
        gradient: "from-purple-600 via-violet-600 to-indigo-500 dark:from-purple-950 dark:via-violet-900 dark:to-indigo-950 text-white",
      };
    }
  }
  return WELCOME_BANNER_DATA[user.role] || {
    title: `Welcome, ${user.name}`,
    sub: "Compliance Operations Manager",
    gradient: "from-indigo-600 to-blue-500 text-white",
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [deptMetrics, setDeptMetrics] = useState<any | null>(null);
  const [deptMaps, setDeptMaps] = useState<MAP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPoints, setShowPoints] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const currUser = await getAuthUser();
      setUser(currUser);
      const adminData = await getAdminMetrics();
      setMetrics(adminData);

      if (currUser) {
        if (currUser.role === "department_lead" && currUser.department_id) {
          const dm = await getDepartmentMetrics(currUser.department_id);
          setDeptMetrics(dm);
          const maps = await getDepartmentMaps(currUser.department_id);
          setDeptMaps(maps);
        } else if (currUser.role === "reviewer") {
          // fetch submitted maps for reviewer validation queue
          const submitted = await getMaps({ status: "submitted" });
          setDeptMaps(submitted);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidate = async (mapId: number) => {
    setActionLoadingId(mapId);
    try {
      await triggerValidation(mapId);
      await new Promise((r) => setTimeout(r, 1000));
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = async (mapId: number) => {
    setActionLoadingId(mapId);
    try {
      await updateMapStatus(mapId, "validated");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!metrics) return null;

  const banner = getBannerConfig(user);

  // Map compliance trend data (0-100%) to points (0-1000) for the PointsChart
  const pointsData = metrics.trend_data.map((item, idx) => {
    const total = Math.round(item.compliance * 10);
    const prev = idx > 0 ? Math.round(metrics.trend_data[idx - 1].compliance * 10) : 0;
    return {
      date: item.week,
      total,
      change: total - prev,
    };
  });

  const levels = [
    { value: 500, color: "#d97706" }, // Bronze
    { value: 800, color: "#94a3b8" }, // Silver
    { value: 950, color: "#eab308" }, // Gold
  ];

  // Helper for overdue styling
  const overdueCount = user?.role === "department_lead" ? (deptMetrics?.overdue_maps || 0) : metrics.overdue_maps;
  const isDeptLead = user?.role === "department_lead";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${banner.gradient} p-6 shadow-md transition-all duration-300`}>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight">{banner.title}</h1>
          <p className="mt-2 text-sm opacity-90 max-w-2xl">{banner.sub}</p>
        </div>
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* KPI Cards based on role */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {isDeptLead && deptMetrics ? (
          <>
            <MetricCard
              label="Dept Compliance"
              value={`${deptMetrics.compliance_score}%`}
              sub="Validated + completed MAPs"
              trend="up"
              accent="text-emerald-600"
            />
            <MetricCard
              label="My Action Points"
              value={deptMetrics.total_maps}
              sub={`${deptMetrics.in_progress_maps} in progress`}
              accent="text-slate-700 dark:text-slate-200"
            />
            <MetricCard
              label="My Overdue Tasks"
              value={deptMetrics.overdue_maps}
              sub="Require urgent attention"
              trend={deptMetrics.overdue_maps > 0 ? "down" : "flat"}
              accent={deptMetrics.overdue_maps > 0 ? "text-red-600" : "text-emerald-600"}
            />
            <MetricCard
              label="Dept Risk Score"
              value={`${deptMetrics.risk_score}%`}
              sub="Based on pending deadliness"
              accent={deptMetrics.risk_score > 20 ? "text-red-600" : "text-emerald-600"}
            />
          </>
        ) : user?.role === "risk_manager" ? (
          <>
            <MetricCard
              label="Overall Compliance"
              value={`${metrics.overall_compliance_score}%`}
              sub="All departments tracked"
              accent="text-slate-700 dark:text-slate-200"
            />
            <MetricCard
              label="Risk Exposure Score"
              value={`${metrics.overall_risk_score}%`}
              sub="Actionable compliance gaps"
              trend={metrics.overall_risk_score > 20 ? "down" : "up"}
              accent={metrics.overall_risk_score > 20 ? "text-red-600" : "text-emerald-600"}
            />
            <MetricCard
              label="Overdue MAPs"
              value={metrics.overdue_maps}
              sub="Across 4 active groups"
              accent={metrics.overdue_maps > 0 ? "text-red-600" : "text-emerald-600"}
            />
            <MetricCard
              label="Solvency Margin Ratio"
              value="1.52x"
              sub="Limit: 1.50x (Regulatory stable)"
              accent="text-emerald-600"
            />
          </>
        ) : (
          <>
            <MetricCard
              label="Overall Compliance"
              value={`${metrics.overall_compliance_score}%`}
              sub="Validated + completed MAPs"
              trend="up"
              accent="text-brand-600"
            />
            <MetricCard
              label="Active MAPs"
              value={metrics.total_maps}
              sub={`${metrics.pending_maps} pending`}
              accent="text-slate-700 dark:text-slate-200"
            />
            <MetricCard
              label="Overdue MAPs"
              value={metrics.overdue_maps}
              sub="Require immediate action"
              trend={metrics.overdue_maps > 0 ? "down" : "flat"}
              accent={metrics.overdue_maps > 0 ? "text-red-600" : "text-emerald-600"}
            />
            <MetricCard
              label="Risk Score"
              value={`${metrics.overall_risk_score}%`}
              sub="Based on overdue ratio"
              accent={metrics.overall_risk_score > 30 ? "text-red-600" : metrics.overall_risk_score > 10 ? "text-amber-600" : "text-emerald-600"}
            />
          </>
        )}
      </div>

      {/* Alert banner */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            <strong>{overdueCount} MAPs are overdue</strong> — {isDeptLead ? "Please submit evidence immediately to resolve this compliance block." : "immediate attention required from department leads."}
          </p>
        </div>
      )}

      {/* Main Charts & Actions Split */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Trend graph (taking 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                {showPoints ? "Compliance Points (Gamified XP)" : "Compliance Trend (8 weeks)"}
              </CardTitle>
              <button
                onClick={() => setShowPoints(!showPoints)}
                className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {showPoints ? "Show Trend %" : "Show Reward Points 🏆"}
              </button>
            </CardHeader>
            <CardContent>
              {showPoints ? (
                <div className="h-[220px]">
                  <PointsChart
                    title={isDeptLead ? `${user?.email === "tech@demo.in" ? "Tech" : "Legal"} Team Weekly XP` : "Weekly Compliance Score (XP)"}
                    data={pointsData}
                    levels={levels}
                    height={170}
                    className="border-0 p-0 bg-transparent shadow-none"
                  />
                </div>
              ) : (
                <ComplianceTrendChart data={metrics.trend_data} />
              )}
            </CardContent>
          </Card>

          {/* Additional details depending on user role */}
          {user?.role === "compliance_officer" && (
            <Card>
              <CardHeader>
                <CardTitle>Department Compliance Health</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-slate-500">Department</th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Total MAPs</th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Completed</th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.maps_by_department.map((d) => (
                      <tr key={d.department} className="border-b border-slate-50 last:border-0 dark:border-slate-800">
                        <td className="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{d.department}</td>
                        <td className="px-5 py-2.5 text-right text-slate-500">{d.total}</td>
                        <td className="px-5 py-2.5 text-right text-emerald-600">{d.completed}</td>
                        <td className="px-5 py-2.5 text-right">
                          <span className={d.overdue > 0 ? "font-semibold text-red-600" : "text-slate-400"}>
                            {d.overdue}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {isDeptLead && (
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Department Status Breakdown</h4>
                    {deptMetrics?.status_breakdown && (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                          <p className="font-bold text-slate-700 dark:text-slate-300">{deptMetrics.status_breakdown.in_progress}</p>
                          <p className="text-slate-400 font-medium">In Progress</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950 p-2 rounded">
                          <p className="font-bold text-amber-600">{deptMetrics.status_breakdown.submitted}</p>
                          <p className="text-amber-500 font-medium">Submitted</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950 p-2 rounded">
                          <p className="font-bold text-emerald-600">{deptMetrics.status_breakdown.validated + deptMetrics.status_breakdown.completed}</p>
                          <p className="text-emerald-500 font-medium">Completed</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Gamification Rankings</h4>
                      <p className="text-xs text-slate-400 mt-1">Your team is in <strong className="text-brand-600 dark:text-brand-400">#2 Place</strong> this week across compliance groups.</p>
                    </div>
                    <Link href="/maps" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline inline-flex items-center gap-1 mt-2">
                      Go to My Action Points <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === "risk_manager" && (
            <Card>
              <CardHeader>
                <CardTitle>Solvency & Risk Controls Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>UPI Transaction Fraud Limit</span>
                    <span className="text-emerald-600">Stable (&lt; 0.05% fraud rate)</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "85%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>Solvency Ratio Buffer</span>
                    <span className="text-amber-500">Approaching 1.50 Limit</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: "95%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Role-Specific Worklist / Alerts (1 column) */}
        <div className="space-y-6">
          {user?.role === "compliance_officer" && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <FileText className="h-4 w-4 text-brand-600" />
                  Regulatory Feed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">NEW PUBLICATION</span>
                    <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">SEBI Cybersecurity Framework</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">Mandates implementation of zero-trust architecture and quarterly assessments.</p>
                  <Link href="/regulatory" className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 mt-2">
                    Ingest circular & extract obligations <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">OBLIGATION EXTRACTED</span>
                    <span className="text-[10px] text-slate-400 font-medium">2 days ago</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">RBI Solvency Margins</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">Minimum solvency ratio of 1.50 must be maintained at all times.</p>
                  <Link href="/maps" className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 mt-2">
                    Manage action points <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === "reviewer" && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  Validation Queue ({deptMaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {deptMaps.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">
                    No action points submitted for review.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[350px] overflow-y-auto">
                    {deptMaps.map((map) => (
                      <div key={map.id} className="p-4 space-y-3">
                        <div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            map.priority === "critical" ? "bg-red-100 text-red-700" :
                            map.priority === "high" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {map.priority}
                          </span>
                          <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1.5 line-clamp-1">{map.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Submitted by department</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleValidate(map.id)}
                            disabled={actionLoadingId === map.id}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            {actionLoadingId === map.id ? "Validating..." : "Run AI Check 🤖"}
                          </button>
                          <button
                            onClick={() => handleApprove(map.id)}
                            disabled={actionLoadingId === map.id}
                            className="bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Approve ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isDeptLead && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-md">Team Deliverables</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {deptMaps.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">
                    No deliverables assigned to your department.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[350px] overflow-y-auto">
                    {deptMaps.map((map) => (
                      <Link key={map.id} href={`/maps/${map.id}`} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            map.status === "submitted" ? "bg-amber-100 text-amber-800" :
                            map.status === "validated" || map.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {map.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400">{map.priority}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-2 line-clamp-1 group-hover:text-brand-600">{map.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Due {map.deadline ? new Date(map.deadline).toLocaleDateString() : "No deadline"}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user?.role === "risk_manager" && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <Shield className="h-4 w-4 text-red-500" />
                  Critical Risks & Gaps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-red-100 dark:border-red-950 p-3 bg-red-50/30 dark:bg-red-950/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 px-1.5 py-0.5 rounded">OVERDUE GAP</span>
                    <span className="text-[10px] text-red-500 font-semibold">Priority: Critical</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Capital Adequacy Dashboard</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Risk department is late in deploying the CBS data alerts dashboard.</p>
                  <Link href="/maps" className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 mt-2">
                    Investigate action point <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="rounded-lg border border-orange-100 dark:border-orange-950 p-3 bg-orange-50/30 dark:bg-orange-950/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 px-1.5 py-0.5 rounded">IN PROGRESS</span>
                    <span className="text-[10px] text-orange-500 font-semibold">Priority: High</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Consent Management Platform</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Technology department is building granular consent storage for DPDP guidelines.</p>
                  <Link href="/maps" className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 mt-2">
                    Review specifications <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* General summary statistics banner */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {[
          { label: "Regulatory Docs", val: metrics.total_documents },
          { label: "Obligations", val: metrics.total_obligations },
          { label: "Total MAPs", val: metrics.total_maps },
          { label: "Validated", val: metrics.validated_maps },
          { label: "Completed", val: metrics.completed_maps },
          { label: "Pending", val: metrics.pending_maps },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{val}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

