"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface Medicine {
  id: number;
  name: string;
  brandName: string | null;
  genericName: string | null;
  specification: string | null;
  stock: number;
  reorderLevel: number;
}

interface LowStockAlertProps {
  medicines: Medicine[];
}

export default function LowStockAlert({ medicines }: LowStockAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get medicines with stock at or below reorder level
  const lowStockMedicines = medicines.filter(
    (med) => med.stock <= med.reorderLevel
  );

  // Separate out of stock and low stock
  const outOfStock = lowStockMedicines.filter((med) => med.stock === 0);
  const lowStock = lowStockMedicines.filter(
    (med) => med.stock > 0 && med.stock <= med.reorderLevel
  );

  if (lowStockMedicines.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-2xl font-bold">✓</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">Stock Levels Good!</h3>
            <p className="text-sm text-green-600">
              All medicines are above minimum stock levels
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-bold text-red-900 text-lg">Low Stock Alert</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm bg-red-200 hover:bg-red-300 text-red-800 rounded-lg transition-colors font-medium"
            >
              {isExpanded ? "Hide" : "Show"} Details
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-full"></span>
              <span className="text-sm font-semibold text-red-700">
                {outOfStock.length} Out of Stock
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-sm font-semibold text-orange-700">
                {lowStock.length} Low Stock
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <p className="text-sm text-red-700">
            Total: <strong>{lowStockMedicines.length} medicines</strong> need
            restocking
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {/* Out of Stock */}
          {outOfStock.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-red-800 mb-2">
                Out of Stock - Urgent Reorder
              </h4>
              <ul className="space-y-1 text-sm text-red-700">
                {outOfStock.map((med) => (
                  <li key={med.id} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="flex-1">
                      <span className="font-semibold">
                        {med.brandName || med.name}
                      </span>
                      {med.genericName && (
                        <span className="text-red-600">
                          {" "}
                          ({med.genericName})
                        </span>
                      )}
                      {med.specification && (
                        <span className="text-red-600">
                          {" "}
                          - {med.specification}
                        </span>
                      )}
                      <span className="text-red-800 font-semibold ml-2">
                        - Stock: 0 / Min: {med.reorderLevel}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Low Stock */}
          {lowStock.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-orange-800 mb-2">
                Low Stock - Reorder Soon
              </h4>
              <ul className="space-y-1 text-sm text-orange-700">
                {lowStock.map((med) => (
                  <li key={med.id} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span className="flex-1">
                      <span className="font-semibold">
                        {med.brandName || med.name}
                      </span>
                      {med.genericName && (
                        <span className="text-orange-600">
                          {" "}
                          ({med.genericName})
                        </span>
                      )}
                      {med.specification && (
                        <span className="text-orange-600">
                          {" "}
                          - {med.specification}
                        </span>
                      )}
                      <span className="text-orange-800 font-semibold ml-2">
                        - Stock: {med.stock} / Min: {med.reorderLevel}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
