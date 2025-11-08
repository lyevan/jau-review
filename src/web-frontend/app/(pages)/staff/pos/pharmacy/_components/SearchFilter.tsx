"use client";

import { useState, useEffect } from "react";
import type { Medicine } from "../page";

interface Props {
  medicines: Medicine[];
  onFilterChange: (filtered: Medicine[]) => void;
}

export default function SearchFilter({ medicines, onFilterChange }: Props) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    let filtered = medicines;

    if (search) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brandName?.toLowerCase().includes(search.toLowerCase()) ||
        m.genericName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    onFilterChange(filtered);
  }, [search, medicines, onFilterChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="Search by brand name or generic name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}
