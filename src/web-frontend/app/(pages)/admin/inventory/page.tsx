"use client";

import { useState, useMemo, useEffect } from "react";
import MedicineTable from "@/app/(pages)/admin/inventory/_components/MedicineTable";
import AddMedicineModal from "@/app/(pages)/admin/inventory/_components/AddMedicineModal";
import EditMedicineModal from "@/app/(pages)/admin/inventory/_components/EditMedicineModal";
import StockInModal from "@/app/(pages)/admin/inventory/_components/StockInModal";
import StockOutModal from "@/app/(pages)/admin/inventory/_components/StockOutModal";
import BatchHistoryModal from "@/app/(pages)/admin/inventory/_components/BatchHistoryModal";
import ExpiringBatchesAlert from "@/app/(pages)/admin/inventory/_components/ExpiringBatchesAlert";
import LowStockAlert from "@/app/(pages)/admin/inventory/_components/LowStockAlert";
import InventoryFilters from "@/app/(pages)/admin/inventory/_components/InventoryFilters";
import { useGetMedicines } from "@/app/_hooks/queries/useMedicines";
import { Medicine as BackendMedicine } from "@/app/_services/medicine.service";

// Frontend Medicine type that matches what components expect
export interface Medicine {
  id: number;
  name: string;
  brandName: string | null;
  genericName: string | null;
  specification: string | null;
  price: number;
  stock: number;
  reorderLevel: number;
  supplier: string | null;
  expiryDate: string | null;
  createdAt: string;
}

export default function InventoryPage() {
  const { data: backendMedicines, isLoading } = useGetMedicines({
    refetchInterval: 10000, // Refetch every 10 seconds for soft real-time updates
  });
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [batchHistoryMedicine, setBatchHistoryMedicine] =
    useState<Medicine | null>(null);

  // Transform backend medicines to frontend format and memoize
  const medicines = useMemo(() => {
    if (!backendMedicines) return [];

    return backendMedicines.map(
      (med: BackendMedicine): Medicine => ({
        id: med.id,
        name: med.name,
        brandName: med.brandName,
        genericName: med.genericName,
        specification: med.specification || null,
        price: Number(med.price),
        stock: med.stock,
        reorderLevel: med.minStock,
        supplier: null, // Not in backend schema
        expiryDate: med.expirationDate,
        createdAt: med.createdAt,
      })
    );
  }, [backendMedicines]);

  // Initialize filtered medicines when data loads
  useEffect(() => {
    setFilteredMedicines(medicines);
  }, [medicines]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: medicines.length,
      lowStock: medicines.filter((m) => m.stock <= m.reorderLevel).length,
      outOfStock: medicines.filter((m) => m.stock === 0).length,
      totalValue: medicines.reduce(
        (sum, m) => sum + (m.price || 0) * (m.stock || 0),
        0
      ),
    };
  }, [medicines]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your medicine stock with batch tracking
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Medicine
            </button>
            <button
              onClick={() => setShowStockInModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              Stock In
            </button>
            <button
              onClick={() => setShowStockOutModal(true)}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center gap-2"
            >
              Stock Out
            </button>
          </div>
        </div>

        {/* Expiring Batches Alert */}
        <div className="mb-6">
          <ExpiringBatchesAlert />
        </div>

        {/* Low Stock Alert */}
        <div className="mb-6">
          <LowStockAlert medicines={medicines} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Total Medicines</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Low Stock Items</p>
            <p className="text-3xl font-bold mt-2 text-orange-600">
              {stats.lowStock}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Out of Stock</p>
            <p className="text-3xl font-bold mt-2 text-red-600">
              {stats.outOfStock}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 text-sm">Total Value</p>
            <p className="text-3xl font-bold mt-2 text-teal-600">
              ₱{stats.totalValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <InventoryFilters
          medicines={medicines || []}
          onFilterChange={setFilteredMedicines}
        />

        {/* Table */}
        <MedicineTable
          medicines={filteredMedicines}
          onEdit={setEditingMedicine}
          onViewBatches={setBatchHistoryMedicine}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMedicineModal onClose={() => setShowAddModal(false)} />
      )}

      {showStockInModal && (
        <StockInModal onClose={() => setShowStockInModal(false)} />
      )}

      {showStockOutModal && (
        <StockOutModal onClose={() => setShowStockOutModal(false)} />
      )}

      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          onClose={() => setEditingMedicine(null)}
        />
      )}

      {batchHistoryMedicine && (
        <BatchHistoryModal
          medicineId={batchHistoryMedicine.id}
          medicineName={batchHistoryMedicine.name}
          onClose={() => setBatchHistoryMedicine(null)}
        />
      )}
    </div>
  );
}
