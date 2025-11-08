"use client";

import { useState, useEffect } from "react";
import type { Transaction } from "../page";

interface Props {
  transactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
}

export default function TransactionFilters({
  transactions,
  onFilterChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (search) {
      filtered = filtered.filter((t) => {
        const searchLower = search.toLowerCase();
        if (t.type === "pharmacy") {
          return (
            t.id.toLowerCase().includes(searchLower) ||
            t.cashier.toLowerCase().includes(searchLower) ||
            t.items.some((item) =>
              item.name.toLowerCase().includes(searchLower)
            )
          );
        } else {
          return (
            t.id.toLowerCase().includes(searchLower) ||
            t.patient.name.toLowerCase().includes(searchLower) ||
            t.doctor.toLowerCase().includes(searchLower) ||
            t.cashier.toLowerCase().includes(searchLower)
          );
        }
      });
    }

    // Transaction type filter
    if (transactionType !== "all") {
      filtered = filtered.filter((t) => t.type === transactionType);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((t) => new Date(t.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((t) => new Date(t.date) <= new Date(dateTo));
    }

    onFilterChange(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, transactionType, dateFrom, dateTo, transactions]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Transactions</option>
          <option value="pharmacy">Pharmacy Only</option>
          <option value="clinic">Clinic Only</option>
        </select>

        <input
          type="date"
          placeholder="From Date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <input
          type="date"
          placeholder="To Date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}
