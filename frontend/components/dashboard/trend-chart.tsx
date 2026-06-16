"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface TrendChartProps {
  data: { week: string; compliance: number }[];
}

export function ComplianceTrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}
          formatter={(v: number) => [`${v}%`, "Compliance"]}
        />
        <Line
          type="monotone"
          dataKey="compliance"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2563eb" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DeptBarChartProps {
  data: { department: string; total: number; completed: number; overdue: number }[];
}

export function DeptBarChart({ data }: DeptBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="department" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e2e8f0" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="total" fill="#bfdbfe" name="Total" radius={[3, 3, 0, 0]} />
        <Bar dataKey="completed" fill="#2563eb" name="Completed" radius={[3, 3, 0, 0]} />
        <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const STATUS_CHART_COLORS: Record<string, string> = {
  pending: "#94a3b8",
  assigned: "#60a5fa",
  in_progress: "#f59e0b",
  submitted: "#a78bfa",
  validated: "#34d399",
  completed: "#22c55e",
};

interface StatusPieProps {
  data: { status: string; count: number }[];
}

export function StatusPieChart({ data }: StatusPieProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={STATUS_CHART_COLORS[entry.status] || "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
