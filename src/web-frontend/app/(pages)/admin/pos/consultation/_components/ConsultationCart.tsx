"use client";

import { useState } from "react";
import type { Patient } from "../page";
import { useGetDoctors } from "@/app/_hooks/queries/useDoctors";

export type DiscountType = "none" | "senior" | "pwd";

interface Props {
  patient: Patient | null;
  consultationFee: number;
  serviceName?: string;
  doctor: string;
  diagnosis: string;
  amountPaid: number;
  onDoctorChange: (doctor: string) => void;
  onDiagnosisChange: (diagnosis: string) => void;
  onAmountPaidChange: (amount: number) => void;
  onCheckout: (discountInfo: {
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

export default function ConsultationCart({
  patient,
  consultationFee,
  serviceName = "General Consultation",
  doctor,
  diagnosis,
  amountPaid,
  onDoctorChange,
  onDiagnosisChange,
  onAmountPaidChange,
  onCheckout,
  isProcessing = false,
}: Props) {
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [idNumber, setIdNumber] = useState("");
  const [cash, setCash] = useState("");

  // Fetch doctors list
  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctors();

  // Prices are VAT-inclusive
  const subtotal = consultationFee;

  // Calculate based on VAT-inclusive prices
  let salesSC = 0;
  let less12VAT = 0;
  let salesWithoutVAT = 0;
  let lessSC = 0;
  let vatAmount = 0;

  if (discountType === "senior" || discountType === "pwd") {
    // For Senior Citizen/PWD discount
    salesSC = subtotal; // Full amount is eligible for discount
    salesWithoutVAT = subtotal / 1.12; // Remove 12% VAT
    less12VAT = subtotal - salesWithoutVAT; // VAT amount
    lessSC = salesWithoutVAT * 0.2; // 20% discount on VAT-exclusive amount
    vatAmount = 0; // VAT exempt
  } else {
    // Regular customer - already includes 12% VAT
    vatAmount = subtotal * 0.12;
  }

  const total =
    discountType === "senior" || discountType === "pwd"
      ? salesWithoutVAT - lessSC
      : subtotal;

  const cashAmount = parseFloat(cash) || 0;
  const change = cashAmount > total ? cashAmount - total : 0;

  const isValid = patient && doctor && cashAmount >= total;

  const handleCheckout = () => {
    if (discountType !== "none" && !idNumber) {
      alert("Please provide ID Number for discount");
      return;
    }

    if (cashAmount < total) {
      alert("Cash amount must be greater than or equal to total");
      return;
    }

    onCheckout({
      type: discountType,
      idNumber,
      patientName: patient?.name || "",
      subtotal,
      vatExemption: less12VAT,
      discount: lessSC,
      tax: vatAmount,
      total,
      cash: cashAmount,
      change,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm sticky top-6 print:relative print:shadow-none print:rounded-none print:w-full print:top-0 print:p-0">
      {/* Header */}
      <div className="p-6 border-b bg-teal-50 print:border-none print:bg-white">
        <h2 className="text-xl font-semibold text-teal-700 print:text-base">
          Consultation Summary
        </h2>
      </div>

      <div className="p-6 space-y-4 print:p-4">
        {/* Patient Info */}
        <div className="bg-gray-50 rounded-lg p-3 print:bg-transparent print:border-b">
          <p className="text-xs text-gray-600 mb-1">Patient</p>
          <p className="font-semibold text-gray-900">
            {patient ? patient.name : "No patient selected"}
          </p>
          {patient && (
            <p className="text-xs text-gray-600 mt-1">
              {patient.age}y/o • {patient.gender}
            </p>
          )}
        </div>

        {/* Consultation Fee */}
        <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 print:border print:bg-transparent">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            {serviceName}
          </p>
          <p className="text-2xl font-bold text-teal-700 print:text-black">
            ₱{consultationFee.toFixed(2)}
          </p>
        </div>

        {/* Doctor Dropdown */}
        <div className="print:hidden">
          <label className="block text-sm font-medium mb-2">
            Attending Doctor *
          </label>
          {doctorsLoading ? (
            <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-400">
              Loading doctors...
            </div>
          ) : (
            <select
              value={doctor}
              onChange={(e) => onDoctorChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc: any) => (
                <option
                  key={doc.id}
                  value={`Dr. ${doc.firstName} ${doc.lastName}`}
                >
                  Dr. {doc.firstName} {doc.lastName} - {doc.specialization}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Diagnosis */}
        <div className="print:hidden">
          <label className="block text-sm font-medium mb-2">
            Diagnosis / Notes
          </label>
          <textarea
            value={diagnosis}
            onChange={(e) => onDiagnosisChange(e.target.value)}
            placeholder="Enter diagnosis or medical notes..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={4}
          />
        </div>

        {/* Discount Type */}
        <div className="print:hidden">
          <label className="block text-sm font-medium mb-2">
            Discount Type
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="none">No Discount</option>
            <option value="senior">Senior Citizen (60+)</option>
            <option value="pwd">PWD</option>
          </select>
          {discountType !== "none" && (
            <p className="text-xs text-teal-600 mt-2 bg-teal-50 p-2 rounded">
              📋 {discountType === "senior" ? "Senior Citizen" : "PWD"}{" "}
              Discount: 12% VAT exemption + 20% discount
            </p>
          )}
        </div>

        {/* ID Number (for discounts) */}
        {discountType !== "none" && (
          <div className="print:hidden">
            <label className="block text-sm font-medium mb-2">
              {discountType === "senior" ? "Senior Citizen" : "PWD"} ID Number *
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
              className="w-full px-4 py-2 border rounded-lg focuCopy what we s:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
        )}

        {/* Payment Method - Cash Only */}
        <div className="print:hidden">
          <label className="block text-sm font-medium mb-2">
            Payment Method
          </label>
          <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-700 font-medium">
            Cash Only
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The clinic currently accepts cash payments only
          </p>
        </div>

        {/* Cash Input */}
        <div className="print:hidden">
          <label className="block text-sm font-medium mb-2">
            Cash Amount *
          </label>
          <input
            type="number"
            step="0.01"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            placeholder="Enter cash amount"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          {cashAmount > 0 && cashAmount < total && (
            <p className="text-xs text-red-600 mt-1">
              Insufficient amount (₱{(total - cashAmount).toFixed(2)} short)
            </p>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="p-6 border-t space-y-3 print:p-4 print:border-t">
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

        <div className="flex justify-between text-xl font-bold border-t pt-3 print:text-base">
          <span>Total:</span>
          <span className="text-teal-700 print:text-black">
            ₱{total.toFixed(2)}
          </span>
        </div>

        {/* Change Display */}
        {cashAmount > 0 && (
          <>
            <div className="flex justify-between text-sm text-gray-600 print:hidden">
              <span>Cash Amount:</span>
              <span>₱{cashAmount.toFixed(2)}</span>
            </div>
            {change > 0 && (
              <div className="flex justify-between text-lg font-semibold text-green-600 print:hidden">
                <span>Change:</span>
                <span>₱{change.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            Print
          </button>
          <button
            onClick={handleCheckout}
            disabled={!isValid || isProcessing}
            className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Process Payment"}
          </button>
        </div>

        {!isValid && (
          <p className="text-xs text-red-600 text-center print:hidden">
            Please fill in all required fields and ensure cash amount is
            sufficient
          </p>
        )}
      </div>
    </div>
  );
}
