"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useGetAppointmentAnalytics } from "@/app/_hooks/queries/useAnalytics";

export default function PatientGraph() {
  const [filter, setFilter] = useState<"day" | "week" | "month">("week");

  // Calculate date ranges based on filter
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    if (filter === "day") {
      // Last 7 days
      startDate.setDate(endDate.getDate() - 6);
    } else if (filter === "week") {
      // Last 8 weeks
      startDate.setDate(endDate.getDate() - 56);
    } else {
      // Last 12 months
      startDate.setMonth(endDate.getMonth() - 11);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, [filter]);

  const { data: analytics, isLoading } = useGetAppointmentAnalytics(dateRange);

  // Transform data based on filter
  const chartData = useMemo(() => {
    if (!analytics?.byDay) return [];

    return analytics.byDay.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      appointments: item.count,
    }));
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-800">
            Appointments Over Time
          </h2>
        </div>
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === f
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="appointments"
            stroke="#14b8a6"
            strokeWidth={3}
            dot={{ fill: "#14b8a6", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
