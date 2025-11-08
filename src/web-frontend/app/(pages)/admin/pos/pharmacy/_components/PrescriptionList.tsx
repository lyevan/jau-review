"use client";

import { useState } from "react";
import { useGetPrescriptions } from "@/app/_hooks/queries/usePrescriptions";
import {
  Search,
  User,
  Calendar,
  FileText,
  ShoppingCart,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CartItem } from "../page";

interface Props {
  onLoadToCart: (items: CartItem[], prescriptionId: number) => void;
}

export default function PrescriptionList({ onLoadToCart }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loadMode, setLoadMode] = useState<"available" | "all">("available");
  const { data: prescriptions, isLoading } = useGetPrescriptions({
    status: "pending", // Only show pending prescriptions
  });

  const handleLoadToCart = async (prescription: any) => {
    if (!prescription.items || prescription.items.length === 0) {
      alert("This prescription has no items");
      return;
    }

    // Filter out external medicines - they cannot be fulfilled from clinic
    const clinicMedicines = prescription.items.filter(
      (item: any) => !item.isExternal
    );

    if (clinicMedicines.length === 0) {
      alert(
        "⚠️ All medicines in this prescription are external.\nPatient must purchase at other pharmacies."
      );
      return;
    }

    // Convert prescription items to cart items based on load mode
    const itemsToLoad =
      loadMode === "available"
        ? clinicMedicines.filter((item: any) => item.isAvailable)
        : clinicMedicines;

    const cartItems: CartItem[] = itemsToLoad.map((item: any) => {
      const availableStock = item.medicineStock || 0;
      const prescribedQty = item.quantity;

      // If item is unavailable or stock is less than prescribed, adjust quantity
      const actualQuantity = item.isAvailable
        ? Math.min(prescribedQty, availableStock)
        : 0;

      return {
        id: item.medicineId,
        name: item.medicineName || `Medicine ID: ${item.medicineId}`,
        brandName: null,
        genericName: null,
        price: parseFloat(item.medicinePrice || "0"),
        stock: availableStock,
        quantity: actualQuantity > 0 ? actualQuantity : 1, // At least 1 for manual adjustment
        prescribedQuantity: prescribedQty,
      };
    });

    if (cartItems.length === 0) {
      alert("No available clinic medicines in this prescription");
      return;
    }

    const externalCount = prescription.items.filter(
      (i: any) => i.isExternal
    ).length;
    const unavailableCount = clinicMedicines.filter(
      (i: any) => !i.isAvailable
    ).length;
    const partialStockCount = clinicMedicines.filter(
      (i: any) => i.isAvailable && i.medicineStock < i.quantity
    ).length;

    let message = `${cartItems.length} clinic items loaded from prescription`;
    if (externalCount > 0) {
      message += `\nℹ️ ${externalCount} external item(s) excluded (patient buys elsewhere)`;
    }
    if (unavailableCount > 0) {
      message += `\n⚠️ ${unavailableCount} clinic item(s) are out of stock`;
    }
    if (partialStockCount > 0) {
      message += `\n⚠️ ${partialStockCount} item(s) have limited stock`;
    }

    onLoadToCart(cartItems, prescription.id);

    // Show detailed alert if there are issues
    if (externalCount > 0 || unavailableCount > 0 || partialStockCount > 0) {
      setTimeout(() => {
        alert(message);
      }, 100);
    }
  };

  const filteredPrescriptions = prescriptions?.filter((p: any) => {
    const patientName =
      `${p.patientFirstName || ""} ${p.patientLastName || ""}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    return (
      patientName.includes(searchLower) || p.id.toString().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Pending Prescriptions</h2>

        {/* Load Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setLoadMode("available")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              loadMode === "available"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ✓ Available Only
          </button>
          <button
            onClick={() => setLoadMode("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              loadMode === "all"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📋 All Items (Adjust Quantities)
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by patient name or prescription ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Prescription List */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : filteredPrescriptions && filteredPrescriptions.length > 0 ? (
          <div className="space-y-3">
            {filteredPrescriptions.map((prescription: any) => (
              <div
                key={prescription.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold text-sm">
                        RX-{prescription.id}
                      </span>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                        {prescription.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span>
                        {prescription.patientFirstName}{" "}
                        {prescription.patientLastName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {prescription.items && prescription.items.length > 0 && (
                      <div className="text-sm text-gray-700 mt-2">
                        <strong>{prescription.items.length} items:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          {prescription.items.map((item: any, idx: number) => {
                            const isExternal = item.isExternal;
                            const stock = item.medicineStock || 0;
                            const needed = item.quantity;
                            const hasPartialStock =
                              !isExternal && item.isAvailable && stock < needed;

                            return (
                              <li
                                key={idx}
                                className="text-xs flex items-center justify-between"
                              >
                                <span className="flex-1">
                                  {item.medicineName ||
                                    `Medicine ID: ${item.medicineId}`}{" "}
                                  - Qty: {item.quantity}
                                  {isExternal && (
                                    <span className="ml-2 text-blue-600 font-semibold">
                                      ℹ️ External (buy elsewhere)
                                    </span>
                                  )}
                                  {!isExternal && !item.isAvailable && (
                                    <span className="ml-2 text-red-600 font-semibold">
                                      ❌ Out of stock
                                    </span>
                                  )}
                                  {!isExternal && hasPartialStock && (
                                    <span className="ml-2 text-orange-600 font-semibold">
                                      ⚠️ Only {stock} available
                                    </span>
                                  )}
                                  {!isExternal &&
                                    item.isAvailable &&
                                    stock >= needed && (
                                      <span className="ml-2 text-green-600 font-semibold">
                                        ✓ In stock
                                      </span>
                                    )}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleLoadToCart(prescription)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Load to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No pending prescriptions</p>
            <p className="text-sm">
              {searchQuery
                ? "Try adjusting your search"
                : "All prescriptions have been fulfilled"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
