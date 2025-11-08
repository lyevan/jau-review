"use client";

import type { Transaction } from "../page";

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionDetails({ transaction, onClose }: Props) {
  const isPharmacy = transaction.type === "pharmacy";
  const themeColor = "teal";
  const bgColor = "bg-teal-50";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${bgColor}`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isPharmacy ? "Pharmacy Transaction" : "Clinic Consultation"}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 text-teal-700`}
                >
                  {transaction.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-mono">
                {transaction.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold mt-1">
                {new Date(transaction.date).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Staff/Cashier</p>
              <p className="font-semibold mt-1">{transaction.cashier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold mt-1">{transaction.paymentMethod}</p>
            </div>

            {!isPharmacy && transaction.type === "clinic" && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-semibold mt-1">
                    {transaction.patient.name}
                    <span className="text-sm text-gray-500 ml-2">
                      ({transaction.patient.id})
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-semibold mt-1">{transaction.doctor}</p>
                </div>
              </>
            )}
          </div>

          {/* Diagnosis / Notes */}
          {!isPharmacy &&
            transaction.type === "clinic" &&
            transaction.diagnosis && (
              <div className={`mb-6 p-4 ${bgColor} rounded-lg`}>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Diagnosis / Notes:
                </p>
                <p className="text-sm">{transaction.diagnosis}</p>
              </div>
            )}

          {/* Items / Services Table */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">
              {isPharmacy ? "Medicines Purchased" : "Consultation Service"}
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {isPharmacy ? (
                      <>
                        <th className="px-4 py-3 text-left font-semibold">
                          Brand Name
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Generic Name
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Total
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left font-semibold">
                          Service
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Price
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isPharmacy && transaction.type === "pharmacy"
                    ? transaction.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">{item.brandName || "-"}</td>
                          <td className="px-4 py-3">
                            {item.genericName || "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            ₱{item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    : transaction.type === "clinic" && (
                        <tr>
                          <td className="px-4 py-3">
                            <p className="font-semibold">
                              General Consultation
                            </p>
                            <p className="text-xs text-gray-600">
                              Standard medical consultation
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            ₱{transaction.consultationFee.toFixed(2)}
                          </td>
                        </tr>
                      )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {transaction.discountType && transaction.discountType !== "none" && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-blue-900">
                    {transaction.discountType === "senior" ? "Senior Citizen Discount" : "PWD Discount"}
                  </span>
                </div>
                {transaction.discountPatientName && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Patient:</span> {transaction.discountPatientName}
                  </p>
                )}
                {transaction.discountIdNumber && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">ID Number:</span> {transaction.discountIdNumber}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  12% VAT Exemption + 20% Discount Applied
                </p>
              </div>
            )}
            
            {/* Sales Breakdown */}
            <div className="border-b pb-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₱{transaction.subtotal.toFixed(2)}</span>
              </div>
              {transaction.discountType && transaction.discountType !== "none" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales SC/PWD%:</span>
                    <span>₱{transaction.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Less 12% VAT:</span>
                    <span>-₱{(transaction.subtotal - transaction.subtotal / 1.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales without VAT:</span>
                    <span>₱{(transaction.subtotal / 1.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Less SC/PWD% (20%):</span>
                    <span>-₱{((transaction.subtotal / 1.12) * 0.2).toFixed(2)}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* VAT Analysis */}
            <div className="border-b pb-3 space-y-2">
              <div className="text-sm font-semibold text-gray-700">VAT Analysis</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VATable Sales (Net of VAT):</span>
                <span>₱{transaction.discountType && transaction.discountType !== "none" ? '0.00' : (transaction.subtotal / 1.12).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT Exempt Sales:</span>
                <span>₱{transaction.discountType && transaction.discountType !== "none" ? (transaction.subtotal / 1.12).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT Zero Rated Sales:</span>
                <span>₱0.00</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-700">VAT Amount:</span>
                <span>₱{transaction.discountType && transaction.discountType !== "none" ? '0.00' : (transaction.subtotal - transaction.subtotal / 1.12).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold pt-2">
              <span>TOTAL PAID:</span>
              <span className="text-teal-600">
                ₱{transaction.total.toFixed(2)}
              </span>
            </div>

            {/* Cash and Change */}
            {transaction.cash !== undefined && transaction.cash > 0 && (
              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cash:</span>
                  <span className="font-semibold">₱{transaction.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Change:</span>
                  <span className="font-semibold">₱{(transaction.change || 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
