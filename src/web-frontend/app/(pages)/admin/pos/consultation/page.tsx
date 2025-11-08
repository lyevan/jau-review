"use client";

import { useState, useEffect, useMemo } from "react";
import ConsultationCart from "./_components/ConsultationCart";
import ConsultationReceipt from "./_components/ConsultationReceipt";
import PendingReceipts from "./_components/PendingReceipts";
import { toast } from "@/app/_utils/toast";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";
import {
  useCreateConsultationPayment,
  useCompleteConsultationPayment,
} from "@/app/_hooks/mutations/useConsultations";
import { useGetPendingConsultationPayments } from "@/app/_hooks/queries/useConsultations";
import { useGetConsultationServices } from "@/app/_hooks/queries/useServices";

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

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

type TabType = "pending" | "new-transaction";

export default function ClinicPOSPage() {
  const [activeTab, setActiveTab] = useState<TabType>("new-transaction");

  // Walk-in patient form state
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [contact, setContact] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [doctor, setDoctor] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const paymentMethod = "cash"; // Fixed to cash only
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] =
    useState<ConsultationReceiptTransaction | null>(null);

  const { data: pendingPayments, isLoading: loadingPending } =
    useGetPendingConsultationPayments();
  const { data: services, isLoading: servicesLoading } =
    useGetConsultationServices(true);
  const createPayment = useCreateConsultationPayment();
  const completePayment = useCompleteConsultationPayment();

  // Get selected service details
  const selectedService = useMemo(() => {
    if (!selectedServiceId || !services) return null;
    return services.find((s) => s.id === selectedServiceId);
  }, [selectedServiceId, services]);

  // Auto-fill amount when service is selected
  useEffect(() => {
    if (selectedService) {
      const price = parseFloat(selectedService.price);
      setAmountPaid(price * 1.12); // Including tax
    }
  }, [selectedService]);

  const handleCheckout = async (discountInfo: {
    type: "none" | "senior" | "pwd";
    idNumber: string;
    patientName: string;
    subtotal: number;
    vatExemption: number;
    discount: number;
    tax: number;
    total: number;
    cash: number;
    change: number;
  }) => {
    // Validation
    if (!patientName.trim()) {
      toast.warning("Missing Information", "Please enter patient name");
      return;
    }

    if (!selectedServiceId) {
      toast.warning("Missing Service", "Please select a consultation service");
      return;
    }

    if (!doctor.trim()) {
      toast.warning("Missing Doctor", "Please enter doctor's name");
      return;
    }

    try {
      // Walk-in patient - no appointment ID
      const payment = await createPayment.mutateAsync({
        appointmentId: undefined, // Walk-in has no appointment
        consultationFee: discountInfo.subtotal,
        tax: discountInfo.tax,
        totalAmount: discountInfo.total,
        amountPaid: discountInfo.total,
        cash: discountInfo.cash,
        change: discountInfo.change,
        paymentMethod,
        discountType: discountInfo.type,
        discountIdNumber: discountInfo.idNumber || undefined,
        discountPatientName: discountInfo.patientName || undefined,
      });

      if (!payment) {
        throw new Error("Failed to create payment");
      }

      // Create transaction for receipt
      const transaction: ConsultationReceiptTransaction = {
        id: payment.transactionId,
        date: new Date().toISOString(),
        patientName,
        patientId: undefined, // Walk-in patient has no ID
        serviceName: selectedService?.name || "Consultation",
        consultationFee: discountInfo.subtotal,
        subtotal: discountInfo.subtotal,
        tax: discountInfo.tax,
        total: discountInfo.total,
        cash: discountInfo.cash,
        change: discountInfo.change,
        discountType: discountInfo.type,
        discountIdNumber: discountInfo.idNumber,
        discountPatientName: discountInfo.patientName,
        doctor,
        diagnosis,
      };

      setLastTransaction(transaction);
      setShowReceipt(true);

      // Reset form
      setPatientName("");
      setAge("");
      setGender("Male");
      setContact("");
      setSelectedServiceId(null);
      setDoctor("");
      setDiagnosis("");
      setAmountPaid(0);

      toast.success(
        "Payment Recorded",
        `Transaction ${payment.transactionId} completed`
      );
    } catch (error: any) {
      toast.error(
        "Payment Failed",
        error.message || "Failed to process consultation payment"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-teal-700">
            Clinic Consultation
          </h1>
          <p className="text-gray-600 mt-1">
            Record patient consultations and payments
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`${
                activeTab === "pending"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Pending Receipts
              {pendingPayments && pendingPayments.length > 0 && (
                <span className="ml-2 bg-teal-100 text-teal-800 py-0.5 px-2.5 rounded-full text-xs font-semibold">
                  {pendingPayments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("new-transaction")}
              className={`${
                activeTab === "new-transaction"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              New Transaction
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "pending" ? (
          <PendingReceipts
            pendingPayments={pendingPayments || []}
            isLoading={loadingPending}
            onComplete={completePayment.mutateAsync}
            isProcessing={completePayment.isPending}
            onShowReceipt={(transaction: ConsultationReceiptTransaction) => {
              setLastTransaction(transaction);
              setShowReceipt(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left section - Walk-in Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-teal-700">
                  Walk-in Patient Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter age"
                      min="0"
                      max="150"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Enter contact number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Service Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-teal-700">
                  Consultation Service <span className="text-red-500">*</span>
                </h2>

                {servicesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    <p className="ml-3 text-gray-600">Loading services...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services && services.length > 0 ? (
                      services.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedServiceId === service.id
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-teal-700">
                                ₱{parseFloat(service.price).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Base Price
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No services available</p>
                        <p className="text-sm mt-1">
                          Please contact administrator to add consultation
                          services
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side (Cart) */}
            <div className="lg:col-span-1">
              <ConsultationCart
                patient={
                  patientName
                    ? {
                        id: 0,
                        name: patientName,
                        age: parseInt(age) || 0,
                        gender,
                        contact: contact || "N/A",
                      }
                    : null
                }
                consultationFee={
                  selectedService ? parseFloat(selectedService.price) : 0
                }
                serviceName={selectedService?.name}
                doctor={doctor}
                diagnosis={diagnosis}
                amountPaid={amountPaid}
                onDoctorChange={setDoctor}
                onDiagnosisChange={setDiagnosis}
                onAmountPaidChange={setAmountPaid}
                onCheckout={handleCheckout}
                isProcessing={createPayment.isPending}
              />
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <ConsultationReceipt
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
