"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";
import { Activity } from "lucide-react";
import { useGetDashboardAnalytics } from "@/app/_hooks/queries/useAnalytics";

const COLORS = ["#f97316", "#3b82f6", "#16a34a", "#eab308", "#8b5cf6", "#ec4899"];

export default function DiagnosisGraph() {
  const { data: analytics, isLoading } = useGetDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading appointments...</div>
        </div>
      </div>
    );
  }

  // Transform appointment status data for the chart
  const appointmentData = Object.entries(analytics?.appointments?.byStatus || {}).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count as number,
    })
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-bold text-slate-800">Appointments by Status</h2>
      </div>
      
      {appointmentData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={appointmentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label={(props: PieLabelRenderProps) => {
                const { name, percent } = props as any;
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }}
              labelLine={{ stroke: "#64748b" }}
            >
              {appointmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No appointment data available</p>
          </div>
        </div>
      )}
    </div>
  );
}
