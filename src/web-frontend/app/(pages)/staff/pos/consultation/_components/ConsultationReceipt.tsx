"use client";

import type { ClinicTransaction } from "../page";

interface Props {
  transaction: ClinicTransaction;
  onClose: () => void;
}

export default function ConsultationReceipt({ transaction: trans, onClose }: Props) {
  const transaction = trans as any;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Receipt Content */}
        <div className="p-8">
          <div className="text-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-teal-600">MEDICAL CLINIC</h2>
            <p className="text-sm text-gray-600">123 Medical St., City</p>
            <p className="text-sm text-gray-600">Tel: (123) 456-7890</p>
            <p className="text-xs text-gray-500 mt-2">OFFICIAL RECEIPT</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Transaction ID:</p>
              <p className="font-mono font-semibold">{transaction.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-semibold">
                {new Date(transaction.date).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Patient Name:</p>
              <p className="font-semibold">{transaction.patientName}</p>
            </div>
            <div>
              <p className="text-gray-600">Patient ID:</p>
              <p className="font-semibold">{(transaction as any).patientId}</p>
            </div>
            <div>
              <p className="text-gray-600">Age / Gender:</p>
              <p className="font-semibold">
                {(transaction as any).patientAge}y/o, {(transaction as any).patientGender}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Contact:</p>
              <p className="font-semibold">{(transaction as any).patientContact}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Attending Doctor:</p>
              <p className="font-semibold">{transaction.doctor}</p>
            </div>
          </div>

          {transaction.diagnosis && (
            <div className="mb-6 p-4 bg-teal-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Diagnosis / Medical Notes:
              </p>
              <p className="text-sm">{transaction.diagnosis}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm text-gray-700">
              SERVICE RENDERED
            </h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">General Consultation</p>
                  <p className="text-sm text-gray-600">
                    Standard medical consultation and check-up
                  </p>
                </div>
                <p className="text-xl font-bold text-teal-600">
                  ₱{transaction.consultationFee.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6 pt-4 border-t-2">
            <div className="flex justify-between">
              <span className="font-medium">Consultation Fee:</span>
              <span>₱{transaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax (12%):</span>
              <span>₱{transaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t-2 pt-3">
              <span>TOTAL AMOUNT PAID:</span>
              <span className="text-teal-600">
                ₱{transaction.total.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                Payment Method:{" "}
                <span className="font-semibold">
                  {transaction.paymentMethod}
                </span>
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p className="font-semibold">
              Thank you for trusting our medical services!
            </p>
            <p className="mt-2">This serves as your official receipt.</p>
            <p className="text-xs mt-2">Cashier: {transaction.cashier}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t p-4 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-fill-primary text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
