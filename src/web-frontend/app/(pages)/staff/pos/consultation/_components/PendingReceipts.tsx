"use client";

import { useState } from "react";
import { ConsultationPayment } from "@/app/_services/consultation.service";

export type DiscountType = "none" | "senior" | "pwd";

interface PendingReceiptsProps {
  pendingPayments: ConsultationPayment[];
  isLoading: boolean;
  onComplete: (params: {
    id: number;
    data: {
      amountPaid: number;
      cash: number;
      change: number;
      paymentMethod: "cash" | "card" | "gcash" | "maya";
      discountType?: DiscountType;
      discountIdNumber?: string;
      discountPatientName?: string;
    };
  }) => Promise<any>;
  isProcessing: boolean;
  onShowReceipt?: (transaction: any) => void;
}

export default function PendingReceipts({
  pendingPayments,
  isLoading,
  onComplete,
  isProcessing,
  onShowReceipt,
}: PendingReceiptsProps) {
  const [selectedPayment, setSelectedPayment] =
    useState<ConsultationPayment | null>(null);
  const [cash, setCash] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "gcash" | "maya"
  >("cash");
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [idNumber, setIdNumber] = useState("");
  const [discountPatientName, setDiscountPatientName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (payment: ConsultationPayment) => {
    setSelectedPayment(payment);
    // Check if payment already has discount applied
    if (payment.discountType && payment.discountType !== "none") {
      setDiscountType(payment.discountType as DiscountType);
      setIdNumber(payment.discountIdNumber || "");
      setDiscountPatientName(payment.discountPatientName || "");
    } else {
      setDiscountType("none");
      setIdNumber("");
      setDiscountPatientName("");
    }
    const total = parseFloat(payment.totalAmount);
    setCash(total.toFixed(2));
    setShowModal(true);
  };

  const handleComplete = async () => {
    if (!selectedPayment) return;

    // Validate discount fields
    if (discountType !== "none" && (!idNumber || !discountPatientName)) {
      alert("Please provide ID Number and Patient Name for discount");
      return;
    }

    // Calculate based on original pending payment values
    const originalSubtotal = parseFloat(selectedPayment.consultationFee);
    const originalTax = parseFloat(selectedPayment.tax);

    // Recalculate with discount if applied
    let subtotal = originalSubtotal;
    let vatExemption = 0;
    let discount = 0;
    let tax = originalTax;
    let total = parseFloat(selectedPayment.totalAmount);

    if (discountType === "senior" || discountType === "pwd") {
      // For Senior Citizen/PWD discount
      const salesWithoutVAT = originalSubtotal / 1.12; // Remove 12% VAT
      vatExemption = originalSubtotal - salesWithoutVAT; // VAT amount
      discount = salesWithoutVAT * 0.2; // 20% discount on VAT-exclusive amount
      tax = 0; // VAT exempt
      total = salesWithoutVAT - discount;
    }

    const cashAmount = parseFloat(cash) || 0;
    const changeAmount = cashAmount - total;

    if (cashAmount < total) {
      alert("Cash amount must be greater than or equal to total");
      return;
    }

    try {
      const result = await onComplete({
        id: selectedPayment.id,
        data: {
          amountPaid: total,
          cash: cashAmount,
          change: changeAmount,
          paymentMethod,
          discountType: discountType !== "none" ? discountType : undefined,
          discountIdNumber: discountType !== "none" ? idNumber : undefined,
          discountPatientName:
            discountType !== "none" ? discountPatientName : undefined,
        },
      });

      // Show receipt if callback provided
      if (onShowReceipt) {
        const patientName =
          selectedPayment.patientFirstName && selectedPayment.patientLastName
            ? `${selectedPayment.patientFirstName} ${selectedPayment.patientLastName}`
            : "Unknown Patient";

        const receiptData = {
          id: result?.transactionId || selectedPayment.transactionId,
          date: new Date().toISOString(),
          patientName,
          patientId: selectedPayment.patientId,
          serviceName: "General Consultation",
          consultationFee: originalSubtotal,
          subtotal: originalSubtotal,
          tax,
          total,
          cash: cashAmount,
          change: changeAmount,
          discountType: discountType !== "none" ? discountType : undefined,
          discountIdNumber: discountType !== "none" ? idNumber : undefined,
          discountPatientName:
            discountType !== "none" ? discountPatientName : undefined,
          doctor: "N/A", // Not available in payment data
          diagnosis: "", // Not available in payment data
        };
        onShowReceipt(receiptData);
      }

      setShowModal(false);
      setSelectedPayment(null);
      setCash("");
      setDiscountType("none");
      setIdNumber("");
      setDiscountPatientName("");
    } catch (error) {
      console.error("Failed to complete payment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (pendingPayments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-6xl text-gray-400">⏱️</div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No Pending Receipts
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            All consultation payments have been processed
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Consultation Receipts
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {pendingPayments.length} payment(s) waiting to be processed
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.transactionId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <div className="text-sm text-gray-900">
                        {payment.patientFirstName && payment.patientLastName
                          ? `${payment.patientFirstName} ${payment.patientLastName}`
                          : "Unknown Patient"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-teal-700">
                      ₱{parseFloat(payment.totalAmount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleString()
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(payment)}
                      className="text-teal-600 hover:text-teal-900 font-semibold"
                      disabled={isProcessing}
                    >
                      Process Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Payment Modal */}
      {showModal &&
        selectedPayment &&
        (() => {
          // Calculate display values
          const originalSubtotal = parseFloat(selectedPayment.consultationFee);
          const originalTax = parseFloat(selectedPayment.tax);

          let subtotal = originalSubtotal;
          let salesWithoutVAT = 0;
          let less12VAT = 0;
          let lessSC = 0;
          let vatAmount = originalTax;
          let total = parseFloat(selectedPayment.totalAmount);

          if (discountType === "senior" || discountType === "pwd") {
            salesWithoutVAT = originalSubtotal / 1.12;
            less12VAT = originalSubtotal - salesWithoutVAT;
            lessSC = salesWithoutVAT * 0.2;
            vatAmount = 0;
            total = salesWithoutVAT - lessSC;
          }

          const cashAmount = parseFloat(cash) || 0;
          const change = cashAmount > total ? cashAmount - total : 0;

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Process Payment
                  </h3>
                </div>

                <div className="px-6 py-4">
                  {/* Payment Details */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Transaction ID:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedPayment.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Patient:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedPayment.patientFirstName &&
                        selectedPayment.patientLastName
                          ? `${selectedPayment.patientFirstName} ${selectedPayment.patientLastName}`
                          : "Unknown Patient"}
                      </span>
                    </div>
                  </div>

                  {/* Discount Section */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <label className="block text-sm font-medium">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) =>
                        setDiscountType(e.target.value as DiscountType)
                      }
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
                            value={discountPatientName}
                            onChange={(e) =>
                              setDiscountPatientName(e.target.value)
                            }
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
                          📋{" "}
                          {discountType === "senior" ? "Senior Citizen" : "PWD"}{" "}
                          Discount: 12% VAT exemption + 20% discount
                        </div>
                      </>
                    )}
                  </div>

                  {/* Amount Breakdown */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">
                        ₱{subtotal.toFixed(2)}
                      </span>
                    </div>

                    {(discountType === "senior" || discountType === "pwd") && (
                      <>
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Less 12% VAT:</span>
                          <span>-₱{less12VAT.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Sales without VAT:
                          </span>
                          <span className="font-medium text-gray-900">
                            ₱{salesWithoutVAT.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Less SC/PWD Discount (20%):</span>
                          <span>-₱{lessSC.toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {vatAmount > 0 && (
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>VAT Amount (12%):</span>
                        <span>₱{vatAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-base font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-teal-700">
                        ₱{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["cash", "card", "gcash", "maya"].map((method) => (
                        <button
                          key={method}
                          onClick={() =>
                            setPaymentMethod(method as typeof paymentMethod)
                          }
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            paymentMethod === method
                              ? "border-teal-600 bg-teal-50 text-teal-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          💳 {method.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cash Amount *
                    </label>
                    <input
                      type="number"
                      value={cash}
                      onChange={(e) => setCash(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min={total}
                      step="0.01"
                      placeholder="Enter cash amount"
                    />
                    {cashAmount > 0 && cashAmount < total && (
                      <p className="text-xs text-red-600 mt-1">
                        Insufficient amount (₱{(total - cashAmount).toFixed(2)}{" "}
                        short)
                      </p>
                    )}
                  </div>

                  {/* Change */}
                  {change > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Change:
                        </span>
                        <span className="text-lg font-bold text-green-700">
                          ₱{change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPayment(null);
                      setCash("");
                      setDiscountType("none");
                      setIdNumber("");
                      setDiscountPatientName("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={
                      isProcessing ||
                      cashAmount < total ||
                      (discountType !== "none" &&
                        (!idNumber || !discountPatientName))
                    }
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Processing..." : "Complete Payment"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
