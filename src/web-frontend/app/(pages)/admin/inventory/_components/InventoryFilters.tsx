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
  const [sortBy, setSortBy] = useState<
    "name" | "stock" | "stock-status" | "expiry-status"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Helper function to get stock status category
  const getStockStatus = (medicine: Medicine): number => {
    if (medicine.stock === 0) return 0; // Out of stock
    if (medicine.stock <= medicine.reorderLevel) return 1; // Low stock
    return 2; // In stock
  };

  // Helper function to get expiry status category
  const getExpiryStatus = (medicine: Medicine): number => {
    if (!medicine.expiryDate) return 3; // No expiry date (lowest priority)

    const expiryDate = new Date(medicine.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return 0; // Expired
    if (daysUntilExpiry <= 30) return 1; // Expiring soon (within 30 days)
    return 2; // Not expiring soon
  };

  useEffect(() => {
    let filtered = medicines;

    if (search) {
      filtered = filtered.filter(
        (m) =>
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

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "stock") {
        comparison = a.stock - b.stock;
      } else if (sortBy === "stock-status") {
        // Sort by status: out of stock → low stock → in stock
        comparison = getStockStatus(a) - getStockStatus(b);
      } else if (sortBy === "expiry-status") {
        // Sort by status: expired → expiring soon → not expiring → no date
        comparison = getExpiryStatus(a) - getExpiryStatus(b);
      } else {
        // Sort by name
        comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    onFilterChange(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, stockStatus, sortBy, sortOrder, medicines]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, brand, or generic name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        {/* Stock Status Filter */}
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Stock Status</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value as
                | "name"
                | "stock"
                | "stock-status"
                | "expiry-status"
            )
          }
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="name">Sort by Name</option>
          <option value="stock">Sort by Stock Quantity</option>
          <option value="stock-status">Sort by Stock Status</option>
          <option value="expiry-status">Sort by Expiry Status</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}
