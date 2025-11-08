"use client";

import { useState, useMemo, useEffect } from "react";
import SearchFilter from "@/app/(pages)/admin/pos/pharmacy/_components/SearchFilter";
import type { Medicine } from "@/app/(pages)/admin/pos/pharmacy/page";
import { useGetMedicines } from "@/app/_hooks/queries/useMedicines";

interface Props {
  onAddToCart: (medicine: Medicine) => void;
}

export default function MedicineList({ onAddToCart }: Props) {
  const { data: medicinesData, isLoading } = useGetMedicines();
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  // Transform medicines data to match interface
  const medicines = useMemo(() => {
    if (!medicinesData) return [];
    return medicinesData.map((med: any) => ({
      id: med.id,
      name: med.name,
      brandName: med.brandName,
      genericName: med.genericName,
      specification: med.specification,
      price: Number(med.price),
      stock: med.stock,
    }));
  }, [medicinesData]);

  // Update filtered medicines when medicines change
  useEffect(() => {
    setFilteredMedicines(medicines);
  }, [medicines]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medicines...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-4">
          Medicines ({medicines.length})
        </h2>
        <SearchFilter
          medicines={medicines}
          onFilterChange={setFilteredMedicines}
        />
      </div>

      <div className="p-6">
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No medicines found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
            {filteredMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className={`border rounded-lg p-4 transition-colors ${
                  medicine.stock === 0
                    ? "bg-gray-50 border-gray-300 cursor-not-allowed"
                    : "hover:border-teal-500 cursor-pointer"
                }`}
                onClick={() => medicine.stock > 0 && onAddToCart(medicine)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {medicine.brandName || medicine.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {medicine.genericName || "-"}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-teal-600">
                    ₱{Number(medicine.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-semibold ${
                      medicine.stock === 0
                        ? "text-red-600"
                        : medicine.stock < 10
                          ? "text-orange-600"
                          : "text-green-600"
                    }`}
                  >
                    {medicine.stock === 0
                      ? "Out of Stock"
                      : `Stock: ${medicine.stock}`}
                  </span>
                  <button
                    className={`px-4 py-1 rounded-lg transition-colors text-sm font-medium ${
                      medicine.stock === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (medicine.stock > 0) {
                        onAddToCart(medicine);
                      }
                    }}
                    disabled={medicine.stock === 0}
                  >
                    {medicine.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
