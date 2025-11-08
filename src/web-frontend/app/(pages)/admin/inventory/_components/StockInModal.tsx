"use client";

import { useState } from "react";
import { useGetMedicines } from "@/app/_hooks/queries/useMedicines";
import { useStockIn } from "@/app/_hooks/mutations/useMedicines";

interface Props {
  onClose: () => void;
}

export default function StockInModal({ onClose }: Props) {
  const { data: medicines } = useGetMedicines();
  const stockIn = useStockIn();
  const [formData, setFormData] = useState({
    medicineId: "",
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    manufactureDate: "",
    supplier: "",
    costPrice: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await stockIn.mutateAsync({
      medicineId: parseInt(formData.medicineId),
      batchNumber: formData.batchNumber,
      quantity: parseInt(formData.quantity),
      expiryDate: formData.expiryDate || undefined,
      manufactureDate: formData.manufactureDate || undefined,
      supplier: formData.supplier || undefined,
      costPrice: formData.costPrice
        ? parseFloat(formData.costPrice)
        : undefined,
      notes: formData.notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Stock In</h2>
              <p className="text-gray-600 text-sm mt-1">
                Add new batch of medicine to inventory
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Medicine Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Medicine *
              </label>
              <select
                required
                value={formData.medicineId}
                onChange={(e) =>
                  setFormData({ ...formData, medicineId: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a medicine</option>
                {medicines?.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.brandName || med.genericName} - {med.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Batch Number *
              </label>
              <input
                type="text"
                required
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. BATCH-2024-001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for this batch
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of units"
                />
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cost Price (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Purchase cost per unit"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manufacture Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Manufacture Date
                </label>
                <input
                  type="date"
                  value={formData.manufactureDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manufactureDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium mb-2">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Supplier name"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about this batch"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
