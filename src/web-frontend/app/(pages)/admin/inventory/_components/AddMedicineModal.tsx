"use client";

import { useState } from "react";
import {
  useCreateMedicine,
  useStockIn,
} from "@/app/_hooks/mutations/useMedicines";

interface Props {
  onClose: () => void;
}

export default function AddMedicineModal({ onClose }: Props) {
  const createMedicine = useCreateMedicine();
  const stockIn = useStockIn();
  const [formData, setFormData] = useState({
    brandName: "",
    genericName: "",
    specification: "",
    price: "",
    stock: "",
    minStock: "",
    expirationDate: "",
    description: "",
    // New batch fields
    batchNumber: "",
    manufactureDate: "",
    supplier: "",
    costPrice: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stockQuantity = parseInt(formData.stock);

    // Step 1: Create the medicine first (with stock = 0 to avoid duplication)
    const newMedicine = await createMedicine.mutateAsync({
      brandName: formData.brandName || undefined,
      genericName: formData.genericName || undefined,
      specification: formData.specification || undefined,
      price: parseFloat(formData.price),
      stock: 0, // Start with 0, will be updated by batch
      minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
      expirationDate: formData.expirationDate || undefined,
      description: formData.description || undefined,
    });

    // Step 2: If stock > 0, create initial batch automatically
    if (stockQuantity > 0 && newMedicine) {
      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const batchNumber =
        formData.batchNumber || `INITIAL-${newMedicine.id}-${today}`;

      await stockIn.mutateAsync({
        medicineId: newMedicine.id,
        batchNumber,
        quantity: stockQuantity,
        expiryDate: formData.expirationDate || undefined,
        manufactureDate: formData.manufactureDate || undefined,
        supplier: formData.supplier || undefined,
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        notes: formData.notes || "Initial stock from medicine creation",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Add New Medicine</h2>
              <p className="text-sm text-gray-600 mt-1">
                If you add stock, a batch will be automatically created for
                tracking
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) =>
                  setFormData({ ...formData, brandName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Biogesic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Generic Name *
              </label>
              <input
                type="text"
                required
                value={formData.genericName}
                onChange={(e) =>
                  setFormData({ ...formData, genericName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Paracetamol"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Specification
              </label>
              <input
                type="text"
                value={formData.specification}
                onChange={(e) =>
                  setFormData({ ...formData, specification: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. 500mg tablet, 100mg/5ml syrup, 10ml vial"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dosage form, strength, and packaging details
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Price (₱) - VAT Inclusive *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Price already includes 12% VAT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reorder Level (Min Stock)
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Default: 10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) =>
                  setFormData({ ...formData, expirationDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Optional description..."
              />
            </div>
          </div>

          {/* Batch Tracking Section (Optional) */}
          {parseInt(formData.stock) > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📦</span>
                <h3 className="font-semibold text-blue-900">
                  Batch Tracking (Optional)
                </h3>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Since you're adding stock, you can optionally enter batch
                details now. If left blank, a batch will be auto-generated as:
                INITIAL-[ID]-[DATE]
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, batchNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Supplier
                  </label>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Batch Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about this batch..."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={createMedicine.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createMedicine.isPending || stockIn.isPending}
            >
              {createMedicine.isPending || stockIn.isPending
                ? "Adding..."
                : "Add Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
