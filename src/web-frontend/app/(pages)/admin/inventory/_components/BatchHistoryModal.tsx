"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MedicineService } from "@/app/_services/medicine.service";

const medicineService = new MedicineService();

interface Props {
  medicineId: number;
  medicineName: string;
  onClose: () => void;
}

export default function BatchHistoryModal({
  medicineId,
  medicineName,
  onClose,
}: Props) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  const { data: batches, isLoading } = useQuery({
    queryKey: ["batches", medicineId],
    queryFn: async () => {
      const response = await medicineService.getBatchesByMedicine(
        session!.user.access_token,
        medicineId
      );
      return response.result;
    },
    enabled: !!session,
  });

  const filteredBatches =
    activeTab === "active"
      ? batches?.filter((b) => b.status === "active" && b.quantity > 0)
      : batches;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "damaged":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const days = Math.floor(
      (new Date(expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Batch History</h2>
              <p className="text-gray-600 mt-1">{medicineName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "active"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Active Batches
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Batches
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : filteredBatches && filteredBatches.length > 0 ? (
            <div className="space-y-4">
              {filteredBatches.map((batch) => {
                const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
                const isExpiringSoon =
                  daysUntilExpiry !== null &&
                  daysUntilExpiry >= 0 &&
                  daysUntilExpiry <= 30;

                return (
                  <div
                    key={batch.id}
                    className={`border rounded-lg p-4 ${
                      isExpiringSoon
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {batch.batchNumber}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              batch.status
                            )}`}
                          >
                            {batch.status.toUpperCase()}
                          </span>
                        </div>
                        {batch.supplier && (
                          <p className="text-sm text-gray-600 mt-1">
                            Supplier: {batch.supplier}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-teal-600">
                          {batch.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          of {batch.originalQuantity} units
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Stock In Date</p>
                        <p className="font-medium">
                          {formatDate(batch.stockInDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expiry Date</p>
                        <p className="font-medium">
                          {formatDate(batch.expiryDate)}
                        </p>
                        {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                          <p
                            className={`text-xs ${
                              isExpiringSoon
                                ? "text-orange-600 font-semibold"
                                : "text-gray-500"
                            }`}
                          >
                            {daysUntilExpiry} days left
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">Manufacture Date</p>
                        <p className="font-medium">
                          {formatDate(batch.manufactureDate)}
                        </p>
                      </div>
                      {batch.costPrice && (
                        <div>
                          <p className="text-gray-600">Cost Price</p>
                          <p className="font-medium">
                            ₱{Number(batch.costPrice).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {batch.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">Notes:</p>
                        <p className="text-sm">{batch.notes}</p>
                      </div>
                    )}

                    {isExpiringSoon && batch.status === "active" && (
                      <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                        <p className="text-sm text-orange-800">
                          ⚠️ <strong>Expiring Soon!</strong> This batch will
                          expire in {daysUntilExpiry} days. Consider
                          prioritizing its use or marking as expired if past
                          date.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No batches found</p>
              <p className="text-gray-400 text-sm mt-2">
                {activeTab === "active"
                  ? "No active batches available for this medicine"
                  : "No batches have been created yet"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              ℹ️ Batches are dispensed using FIFO (First In First Out) method
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
