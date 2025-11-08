"use client";

import type { CartItem } from "../page";

interface Props {
  items: CartItem[];
  subtotal: number;
  vatExemption: number;
  discount: number;
  tax: number;
  total: number;
  cash: number;
  change: number;
  discountType: "none" | "senior" | "pwd";
  discountIdNumber: string;
  discountPatientName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  items,
  subtotal,
  vatExemption,
  discount,
  tax,
  total,
  cash,
  change,
  discountType,
  discountIdNumber,
  discountPatientName,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-teal-50">
          <h2 className="text-2xl font-bold text-gray-900">Confirm Sale</h2>
          <p className="text-sm text-gray-600 mt-1">
            Please review the order details before completing the transaction
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Discount Info */}
          {discountType !== "none" && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-blue-900">
                  {discountType === "senior" ? "Senior Citizen Discount" : "PWD Discount"}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Patient:</span> {discountPatientName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">ID Number:</span> {discountIdNumber}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                12% VAT Exemption + 20% Discount Applied
              </p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Items ({items.length})</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Medicine</th>
                    <th className="px-4 py-3 text-center font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.brandName || item.name}</div>
                        <div className="text-xs text-gray-500">{item.genericName}</div>
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        ₱{item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
            </div>
            
            {discountType !== "none" ? (
              <>
                <div className="flex justify-between text-green-600">
                  <span>VAT Exemption (12%):</span>
                  <span className="font-semibold">-₱{vatExemption.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount (20%):</span>
                  <span className="font-semibold">-₱{discount.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (12%):</span>
                <span className="font-semibold">₱{tax.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xl font-bold border-t pt-3">
              <span>TOTAL:</span>
              <span className="text-teal-600">₱{total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg border-t pt-3">
              <span className="font-medium">Cash:</span>
              <span className="font-semibold">₱{cash.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg text-blue-600">
              <span className="font-medium">Change:</span>
              <span className="font-semibold">₱{change.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
          >
            Confirm & Process Sale
          </button>
        </div>
      </div>
    </div>
  );
}
