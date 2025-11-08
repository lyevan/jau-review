"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { useGetInventoryAnalytics } from "@/app/_hooks/queries/useAnalytics";

const getBarColor = (stock: number) => {
  if (stock === 0) return "#dc2626";
  if (stock <= 2) return "#f97316";
  if (stock <= 3) return "#eab308";
  return "#22c55e";
};

export default function InventoryGraph() {
  const { data: analytics, isLoading } = useGetInventoryAnalytics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="h-[450px] flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  const lowStockMedicines = analytics?.lowStockMedicines || [];
  const outOfStockMedicines = analytics?.outOfStockMedicines || [];
  
  // Combine and sort data
  const allMedicines = [
    ...outOfStockMedicines.map(m => ({ medicine: m.name, stock: 0 })),
    ...lowStockMedicines.map(m => ({ medicine: m.name, stock: m.stock }))
  ].sort((a, b) => a.stock - b.stock).slice(0, 10); // Show top 10

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-slate-800">Low / Out-of-Stock Medicines</h2>
        </div>
        <p className="text-sm text-slate-600">
          Sorted from lowest to highest stock levels ({analytics?.lowStockCount || 0} low stock, {analytics?.outOfStockCount || 0} out of stock)
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-600"></div>
          <span className="text-xs text-slate-600">Out of Stock</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-xs text-slate-600">Critical (1-2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-xs text-slate-600">Low (3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-xs text-slate-600">Adequate (4+)</span>
        </div>
      </div>

      {allMedicines.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={allMedicines} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="medicine"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              style={{ fontSize: "11px" }}
              stroke="#64748b"
            />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value} units`, "Stock"]}
            />
            <Bar dataKey="stock" barSize={40} radius={[8, 8, 0, 0]} label={{ position: "top", fontSize: 12 }}>
              {allMedicines.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.stock)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[350px] flex items-center justify-center text-slate-400">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>All medicines are in stock!</p>
          </div>
        </div>
      )}
    </div>
  );
}
