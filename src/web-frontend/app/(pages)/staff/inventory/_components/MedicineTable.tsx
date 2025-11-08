"use client";

import type { Medicine } from "../page";
import { useDeleteMedicine } from "@/app/_hooks/mutations/useMedicines";
import { toast } from "@/app/_utils/toast";

interface Props {
  medicines: Medicine[];
  onEdit: (medicine: Medicine) => void;
}

export default function MedicineTable({ medicines, onEdit }: Props) {
  const deleteMedicine = useDeleteMedicine();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMedicine.mutateAsync(id);
    }
  };

  const getStockBadge = (medicine: Medicine) => {
    if (medicine.stock === 0) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          Out of Stock
        </span>
      );
    }
    if (medicine.stock <= medicine.reorderLevel) {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        In Stock
      </span>
    );
  };

  const getExpiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">No expiry</span>
        </div>
      );
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const formattedDate = expiry.toLocaleDateString();

    if (diffDays < 0) {
      return (
        <div className="flex flex-col items-center">
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold mb-1">
            Expired
          </span>
          <span className="text-xs text-gray-600">{formattedDate}</span>
        </div>
      );
    }
    if (diffDays <= 30) {
      return (
        <div className="flex flex-col items-center">
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-1">
            Expiring Soon
          </span>
          <span className="text-xs text-gray-600">{formattedDate}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-1">
          Valid
        </span>
        <span className="text-xs text-gray-600">{formattedDate}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Brand Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Generic Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Price
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Stock
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Expiry
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {medicines.map((medicine) => (
              <tr
                key={medicine.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {medicine.brandName || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {medicine.genericName || "-"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                  ₱{Number(medicine.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                  {medicine.stock}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  {getStockBadge(medicine)}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  {getExpiryBadge(medicine.expiryDate)}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(medicine)}
                      className="px-3 py-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(medicine.id, medicine.name)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={deleteMedicine.isPending}
                    >
                      {deleteMedicine.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {medicines.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No medicines found
        </div>
      )}
    </div>
  );
}
