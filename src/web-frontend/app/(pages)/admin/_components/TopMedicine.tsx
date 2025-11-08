"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Package } from "lucide-react";
import { useGetMedicines } from "@/app/_hooks/queries/useMedicines";

const COLORS = ["#3b82f6", "#f97316", "#16a34a", "#eab308", "#8b5cf6"];

export default function TopMedicine() {
  const { data: medicines, isLoading } = useGetMedicines();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading medicines...</div>
        </div>
      </div>
    );
  }

  // Get top 5 medicines by stock (most stocked)
  const topMedicines = (medicines || [])
    .sort((a: any, b: any) => b.stock - a.stock)
    .slice(0, 5)
    .map((med: any) => ({
      name: med.name,
      value: med.stock,
    }));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6 text-teal-600" />
        <h2 className="text-xl font-bold text-slate-800">Top 5 Stocked Medicines</h2>
      </div>
      
      {topMedicines.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topMedicines}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={{ stroke: "#64748b" }}
            >
              {topMedicines.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value} units in stock`}
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
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No medicine data available</p>
          </div>
        </div>
      )}
    </div>
  );
}
