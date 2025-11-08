"use client";

import {
  Prescription,
  PrescriptionItem,
} from "@/app/_services/prescription.service";

interface Props {
  prescription: {
    prescription: Prescription;
    items: PrescriptionItem[];
    availabilityCheck?: any[];
  };
  onClose: () => void;
  patientName?: string;
  doctorName?: string;
}

export default function PrescriptionModal({
  prescription,
  onClose,
  patientName,
  doctorName,
}: Props) {
  console.log("\n========================================");
  console.log("💊 PrescriptionModal opened");
  console.log("========================================");
  console.log("Prescription data:", JSON.stringify(prescription, null, 2));
  console.log("Patient name:", patientName);
  console.log("Doctor name:", doctorName);
  console.log("========================================\n");

  // Handle both nested and direct prescription structures
  const prescriptionData = (prescription.prescription || prescription) as any;
  const items = prescription.items || [];
  const availabilityCheck = prescription.availabilityCheck || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Print-friendly content */}
        <div className="p-8" id="prescription-content">
          {/* Header */}
          <div className="text-center border-b-2 border-teal-600 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-teal-700">JAU CLINIC</h1>
            <p className="text-sm text-gray-600">123 Medical St., City</p>
            <p className="text-sm text-gray-600">Tel: (123) 456-7890</p>
            <h2 className="text-xl font-semibold mt-4 text-gray-800">
              PRESCRIPTION
            </h2>
          </div>

          {/* Prescription Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Date:</p>
              <p className="font-semibold">
                {prescriptionData.createdAt
                  ? new Date(prescriptionData.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prescription ID:</p>
              <p className="font-semibold font-mono">
                RX-{prescriptionData.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient Name:</p>
              <p className="font-semibold">{patientName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Doctor:</p>
              <p className="font-semibold">{doctorName || "N/A"}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                prescriptionData.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : prescriptionData.status === "fulfilled"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {prescriptionData.status.toUpperCase()}
            </span>
          </div>

          {/* Medications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Medications Prescribed (Rx)
            </h3>

            {/* Separate external and clinic medicines */}
            {items.some((item: any) => item.isExternal) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Notice:</strong> This prescription contains
                  medicines not available at our clinic. These can be purchased
                  at any pharmacy.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {items.map((item: any, index: number) => {
                const availability = availabilityCheck?.find(
                  (check: any) => check.medicineId === item.medicineId
                );

                return (
                  <div
                    key={item.id || index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">
                          {index + 1}.{" "}
                          {item.medicineName ||
                            `Medicine ID: ${item.medicineId}`}
                        </p>

                        {/* External medicine badge */}
                        {item.isExternal && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2">
                            ℹ️ External - Purchase at any pharmacy
                          </span>
                        )}

                        {/* Availability for clinic medicines */}
                        {!item.isExternal &&
                          availability &&
                          !availability.isAvailable && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              ⚠️{" "}
                              {availability.reason || "Not available in stock"}
                            </span>
                          )}

                        {!item.isExternal &&
                          availability &&
                          availability.isAvailable && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              ✓ Available at our clinic
                            </span>
                          )}
                        {availability && availability.isAvailable && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✓ Available in pharmacy
                          </span>
                        )}
                      </div>
                      <span className="text-gray-600 font-semibold">
                        Qty: {item.quantity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      {item.dosage && (
                        <div>
                          <span className="text-gray-600">Dosage:</span>{" "}
                          <span className="font-medium">{item.dosage}</span>
                        </div>
                      )}
                      {item.frequency && (
                        <div>
                          <span className="text-gray-600">Frequency:</span>{" "}
                          <span className="font-medium">{item.frequency}</span>
                        </div>
                      )}
                      {item.duration && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Duration:</span>{" "}
                          <span className="font-medium">{item.duration}</span>
                        </div>
                      )}
                      {item.instructions && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Instructions:</span>{" "}
                          <span className="font-medium">
                            {item.instructions}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {prescriptionData.notes && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                Doctor's Notes:
              </h4>
              <p className="text-sm text-gray-700">{prescriptionData.notes}</p>
            </div>
          )}

          {/* Footer / Signature */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600 mb-8">Patient Signature:</p>
                <div className="border-b border-gray-400 w-48"></div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">
                  Doctor's Signature:
                </p>
                <div className="border-b border-gray-400 w-48 mb-1"></div>
                <p className="text-xs text-gray-600">{doctorName || "N/A"}</p>
                <p className="text-xs text-gray-600">
                  License No: ______________
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600 text-center">
            <p>
              This prescription is valid for 6 months from the date of issue.
            </p>
            <p className="mt-1">
              Please consult your doctor before stopping any medication.
            </p>
          </div>
        </div>

        {/* Action Buttons (hidden in print) */}
        <div className="border-t p-4 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
          >
            🖨️ Print Prescription
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #prescription-content,
          #prescription-content * {
            visibility: visible;
          }
          #prescription-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
