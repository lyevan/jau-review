"use client";

import { useState, useEffect } from "react";
import type { Medicine } from "@/app/(pages)/admin/inventory/page";

interface Props {
  medicines: Medicine[];
  onFilterChange: (filtered: Medicine[]) => void;
}

export default function InventoryFilters({ medicines, onFilterChange }: Props) {
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("all");

  useEffect(() => {
    let filtered = medicines;

    if (search) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brandName?.toLowerCase().includes(search.toLowerCase()) ||
        m.genericName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stockStatus === "low") {
      filtered = filtered.filter(
        (m) => m.stock <= m.reorderLevel && m.stock > 0
      );
    } else if (stockStatus === "out") {
      filtered = filtered.filter((m) => m.stock === 0);
    }

    onFilterChange(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, stockStatus, medicines]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search by name, brand, or generic name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Stock Status</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>
    </div>
  );
}
