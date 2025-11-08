"use client";

import { useState } from "react";
import type { CartItem } from "../page";

export type DiscountType = "none" | "senior" | "pwd";

interface Props {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onCheckout: (discountInfo: {
    type: DiscountType;
    idNumber: string;
    patientName: string;
  }) => void;
  onShowConfirmation: (discountInfo: {
    type: DiscountType;
    idNumber: string;
    patientName: string;
    subtotal: number;
    vatExemption: number;
    discount: number;
    tax: number;
    total: number;
    cash: number;
    change: number;
  }) => void;
  isProcessing?: boolean;
}

export default function Cart({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  onShowConfirmation,
  isProcessing = false,
}: Props) {
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [idNumber, setIdNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [cash, setCash] = useState("");

  // Prices are VAT-inclusive
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate based on VAT-inclusive prices
  let salesSC = 0;
  let less12VAT = 0;
  let salesWithoutVAT = 0;
  let lessSC = 0;
  let vatAmount = 0;
  let vatExemptSales = 0;
  let vatableSales = 0;

  if (discountType === "senior" || discountType === "pwd") {
    // For Senior Citizen/PWD discount
    salesSC = subtotal; // Full amount is eligible for discount
    salesWithoutVAT = subtotal / 1.12; // Remove 12% VAT
    less12VAT = subtotal - salesWithoutVAT; // VAT amount
    lessSC = salesWithoutVAT * 0.2; // 20% discount on VAT-exclusive amount
    vatExemptSales = salesWithoutVAT;
    vatAmount = 0; // VAT exempt
  } else {
    // Regular customer
    vatableSales = subtotal / 1.12; // Amount net of VAT
    vatAmount = subtotal - vatableSales; // VAT amount (12%)
  }

  const total = discountType === "senior" || discountType === "pwd" 
    ? salesWithoutVAT - lessSC 
    : subtotal;

  const handleCheckout = () => {
    if (discountType !== "none" && (!idNumber || !patientName)) {
      alert("Please provide ID Number and Patient Name for discount");
      return;
    }
    
    const cashAmount = parseFloat(cash) || 0;
    const changeAmount = cashAmount - total;
    
    if (cashAmount < total) {
      alert("Cash amount must be greater than or equal to total");
      return;
    }
    
    onShowConfirmation({
      type: discountType,
      idNumber,
      patientName,
      subtotal,
      vatExemption: less12VAT,
      discount: lessSC,
      tax: vatAmount,
      total,
      cash: cashAmount,
      change: changeAmount,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm sticky top-6">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Cart ({items.length})</h2>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Cart is empty</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ₱{Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="w-8 h-8 rounded border hover:bg-gray-100"
                    >
                      -
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (
                          !isNaN(value) &&
                          value >= 1 &&
                          value <= item.stock
                        ) {
                          onUpdateQuantity(item.id, value);
                        }
                      }}
                      className="w-16 text-center border rounded-lg py-1"
                    />

                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.id,
                          Math.min(item.stock, item.quantity + 1)
                        )
                      }
                      className="w-8 h-8 rounded border hover:bg-gray-100"
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  <span className="font-semibold">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="p-6 border-t space-y-3">
          {/* Discount Section */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <label className="block text-sm font-medium">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="none">No Discount</option>
              <option value="senior">Senior Citizen (60+)</option>
              <option value="pwd">PWD</option>
            </select>

            {discountType !== "none" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={
                      discountType === "senior"
                        ? "OSCA ID / Passport / Gov't ID"
                        : "PWD ID Number"
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  📋 {discountType === "senior" ? "Senior Citizen" : "PWD"} Discount: 12% VAT exemption + 20% discount
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>

          {(discountType === "senior" || discountType === "pwd") && (
            <>
              <div className="flex justify-between text-sm text-green-600">
                <span>Less 12% VAT:</span>
                <span>-₱{less12VAT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sales without VAT:</span>
                <span>₱{salesWithoutVAT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Less SC/PWD Discount (20%):</span>
                <span>-₱{lessSC.toFixed(2)}</span>
              </div>
            </>
          )}

          {vatAmount > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>VAT Amount (12%):</span>
              <span>₱{vatAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>Total:</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          {/* Cash Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Cash Amount *
            </label>
            <input
              type="number"
              step="0.01"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="Enter cash amount"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {cash && parseFloat(cash) >= total && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Change:</span>
              <span>₱{(parseFloat(cash) - total).toFixed(2)}</span>
            </div>
          )}
          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}
