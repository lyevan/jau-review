"use client";

interface ConsultationReceiptTransaction {
  id: string;
  date: string;
  patientName: string;
  patientId?: number;
  serviceName?: string;
  consultationFee: number;
  subtotal: number;
  tax: number;
  total: number;
  cash?: number;
  change?: number;
  discountType?: string;
  discountIdNumber?: string;
  discountPatientName?: string;
  doctor?: string;
  diagnosis?: string;
}

interface Props {
  transaction: ConsultationReceiptTransaction;
  onClose: () => void;
}

export default function ConsultationReceipt({ transaction, onClose }: Props) {
  const subtotal = transaction.consultationFee;
  const isDiscounted =
    transaction.discountType && transaction.discountType !== "none";

  let salesSC = 0;
  let less12VAT = 0;
  let salesWithoutVAT = 0;
  let lessSC = 0;
  let totalDue = 0;
  let vatableSales = 0;
  let vatExemptSales = 0;
  let vatAmount = 0;

  if (isDiscounted) {
    salesSC = subtotal;
    salesWithoutVAT = subtotal / 1.12;
    less12VAT = subtotal - salesWithoutVAT;
    lessSC = salesWithoutVAT * 0.2;
    totalDue = salesWithoutVAT - lessSC;
    vatExemptSales = salesWithoutVAT;
    vatAmount = 0;
  } else {
    salesSC = 0;
    less12VAT = 0;
    salesWithoutVAT = 0;
    lessSC = 0;
    totalDue = subtotal;
    vatableSales = subtotal / 1.12;
    vatAmount = subtotal - vatableSales;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">JAU CLINIC</h2>
            <p className="text-sm text-gray-600">123 Medical St., City</p>
            <p className="text-sm text-gray-600">Tel: (123) 456-7890</p>
            <p className="text-xs text-gray-500 mt-2">CONSULTATION RECEIPT</p>
          </div>

          <div className="border-t border-b border-dashed py-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Transaction ID:</span>
              <span className="font-mono">{transaction.id}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Date:</span>
              <span>{new Date(transaction.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Patient:</span>
              <span className="font-semibold">{transaction.patientName}</span>
            </div>
            {transaction.doctor && (
              <div className="flex justify-between text-sm">
                <span>Doctor:</span>
                <span className="font-semibold">{transaction.doctor}</span>
              </div>
            )}
          </div>

          {transaction.diagnosis && (
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
              <p className="font-semibold text-gray-700 mb-1">Diagnosis:</p>
              <p className="text-gray-600">{transaction.diagnosis}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg text-teal-900">
                    {transaction.serviceName || "General Consultation"}
                  </p>
                  <p className="text-sm text-gray-600">Medical Consultation</p>
                </div>
                <p className="text-xl font-bold text-teal-600">
                  ₱{subtotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {isDiscounted && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-left">
                <div className="font-semibold text-sm text-blue-900 mb-1">
                  {transaction.discountType === "senior"
                    ? "SENIOR CITIZEN DISCOUNT"
                    : "PWD DISCOUNT"}
                </div>
                <div className="text-xs text-gray-700 space-y-0.5">
                  <p>
                    <span className="font-medium">Patient:</span>{" "}
                    {transaction.discountPatientName}
                  </p>
                  <p>
                    <span className="font-medium">ID Number:</span>{" "}
                    {transaction.discountIdNumber}
                  </p>
                  <p className="text-gray-600 mt-1">
                    12% VAT Exemption + 20% Discount
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-b border-dashed py-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Consultation Fee:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>

              {isDiscounted && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Sales SC/PWD%:</span>
                    <span>{isDiscounted ? `₱${salesSC.toFixed(2)}` : "0"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Less 12% VAT:</span>
                    <span>
                      {isDiscounted ? `₱${less12VAT.toFixed(2)}` : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sales without VAT:</span>
                    <span>
                      {isDiscounted ? `₱${salesWithoutVAT.toFixed(2)}` : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Less SC/PWD%:</span>
                    <span>{isDiscounted ? `₱${lessSC.toFixed(2)}` : "0"}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Total Due:</span>
                <span>₱{totalDue.toFixed(2)}</span>
              </div>

              {transaction.cash && (
                <>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Cash:</span>
                    <span>
                      ₱{parseFloat(transaction.cash.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Change:</span>
                    <span>
                      ₱
                      {parseFloat((transaction.change || 0).toString()).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-dashed pt-3 mt-3 space-y-1 text-sm">
              <div className="font-semibold mb-2">VAT Analysis</div>
              <div className="flex justify-between">
                <span>VATable Sales (Amount Net of VAT):</span>
                <span>₱{vatableSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT Exempt Sales:</span>
                <span>₱{vatExemptSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT Zero Rated Sales:</span>
                <span>₱0.00</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>VAT Amount:</span>
                <span>₱{vatAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 mb-6">
            <p>Thank you for your visit!</p>
            <p>This serves as your official receipt.</p>
          </div>
        </div>

        <div className="border-t p-4 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
