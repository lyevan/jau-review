"use client";

import { useState } from "react";
import { useGetMedicines } from "@/app/_hooks/queries/useMedicines";
import { useStockOut } from "@/app/_hooks/mutations/useMedicines";

interface Props {
  onClose: () => void;
}

export default function StockOutModal({ onClose }: Props) {
  const { data: medicines } = useGetMedicines();
  const stockOut = useStockOut();
  const [formData, setFormData] = useState({
    medicineId: "",
    quantity: "",
    reason: "damaged", // damaged, expired, dispensed
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await stockOut.mutateAsync({
      medicineId: parseInt(formData.medicineId),
      quantity: parseInt(formData.quantity),
      reason: formData.reason,
      notes: formData.notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Stock Out</h2>
              <p className="text-gray-600 text-sm mt-1">
                Remove medicine from inventory (expired, damaged, etc.)
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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a medicine</option>
                {medicines?.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.brandName || med.genericName} - Stock: {med.stock}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium mb-2">Reason *</label>
              <select
                required
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="damaged">Damaged</option>
                <option value="expired">Expired</option>
                <option value="dispensed">Dispensed (Manual)</option>
                <option value="returned">Returned to Supplier</option>
                <option value="other">Other</option>
              </select>
            </div>

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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Number of units to remove"
              />
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Stock will be removed using FIFO (oldest batch first)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes *</label>
              <textarea
                required
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Explain why stock is being removed"
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> This action will permanently remove
                stock from your inventory. Make sure the details are correct.
              </p>
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
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Remove Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
