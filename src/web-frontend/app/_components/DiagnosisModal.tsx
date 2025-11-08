"use client";
import { useState } from "react";
import { X, Plus, Trash2, Pill } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createVisitSchema,
  CreateVisitSchema,
} from "@/app/_schema/visit.schema";
import { useGetConsultationServices } from "@/app/_hooks/queries/useServices";
import { useGetMedicines } from "@/app/_hooks/queries/useMedicines";

interface DiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVisitSchema) => void;
  appointmentData: {
    id: number;
    patientId: number;
    patientName: string;
    reason?: string;
  };
  isSubmitting?: boolean;
}

interface DiagnosisEntry {
  diagnosisCode: string;
  diagnosisDescription: string;
}

interface PrescriptionEntry {
  medicineId?: number;
  medicineName?: string;
  isExternal: boolean;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function DiagnosisModal({
  isOpen,
  onClose,
  onSubmit,
  appointmentData,
  isSubmitting = false,
}: DiagnosisModalProps) {
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([
    { diagnosisCode: "", diagnosisDescription: "" },
  ]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionEntry[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );

  const { data: services } = useGetConsultationServices(true); // Active services only
  const { data: medicines } = useGetMedicines();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateVisitSchema>({
    resolver: zodResolver(createVisitSchema),
    defaultValues: {
      appointmentId: appointmentData.id,
      patientId: appointmentData.patientId,
      chiefComplaint: appointmentData.reason || "",
    },
  });

  const handleAddDiagnosis = () => {
    setDiagnoses([
      ...diagnoses,
      { diagnosisCode: "", diagnosisDescription: "" },
    ]);
  };

  const handleRemoveDiagnosis = (index: number) => {
    if (diagnoses.length > 1) {
      setDiagnoses(diagnoses.filter((_, i) => i !== index));
    }
  };

  const handleDiagnosisChange = (
    index: number,
    field: "diagnosisCode" | "diagnosisDescription",
    value: string
  ) => {
    const newDiagnoses = [...diagnoses];
    newDiagnoses[index][field] = value;
    setDiagnoses(newDiagnoses);
  };

  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medicineId: undefined,
        medicineName: "",
        isExternal: false,
        quantity: 1,
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (
    index: number,
    field: keyof PrescriptionEntry,
    value: any
  ) => {
    const newPrescriptions = [...prescriptions];
    (newPrescriptions[index] as any)[field] = value;
    setPrescriptions(newPrescriptions);
  };

  const onFormSubmit = (data: any) => {
    // Filter out empty diagnoses
    const validDiagnoses = diagnoses.filter(
      (d) => d.diagnosisDescription.trim() !== ""
    );

    if (validDiagnoses.length === 0) {
      alert("Please add at least one diagnosis");
      return;
    }

    // Filter out invalid prescriptions
    const validPrescriptions = prescriptions.filter((p) => {
      // External medicine must have medicineName
      if (p.isExternal) {
        return p.medicineName && p.medicineName.trim() !== "" && p.quantity > 0;
      }
      // Clinic medicine must have medicineId
      return p.medicineId && p.medicineId > 0 && p.quantity > 0;
    });

    onSubmit({
      ...data,
      serviceId: selectedServiceId,
      diagnoses: validDiagnoses,
      prescriptions:
        validPrescriptions.length > 0 ? validPrescriptions : undefined,
      prescriptionNotes: prescriptionNotes.trim() || undefined,
    });

    // Reset form
    reset();
    setDiagnoses([{ diagnosisCode: "", diagnosisDescription: "" }]);
    setPrescriptions([]);
    setPrescriptionNotes("");
    setSelectedServiceId(null);
  };

  const handleClose = () => {
    reset();
    setDiagnoses([{ diagnosisCode: "", diagnosisDescription: "" }]);
    setPrescriptions([]);
    setPrescriptionNotes("");
    setSelectedServiceId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Complete Appointment
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Patient:{" "}
              <span className="font-medium">{appointmentData.patientName}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Chief Complaint */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Chief Complaint
            </label>
            <textarea
              {...register("chiefComplaint")}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Patient's main complaint or reason for visit"
            />
          </div>

          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Vital Signs (Optional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Blood Pressure
                </label>
                <input
                  {...register("vitals.bloodPressure")}
                  type="text"
                  placeholder="120/80"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Temperature (°C)
                </label>
                <input
                  {...register("vitals.temperature")}
                  type="text"
                  placeholder="36.5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  {...register("vitals.heartRate", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  type="number"
                  placeholder="72"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Respiratory Rate
                </label>
                <input
                  {...register("vitals.respiratoryRate", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  type="number"
                  placeholder="16"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Weight (kg)
                </label>
                <input
                  {...register("vitals.weight")}
                  type="text"
                  placeholder="70"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Height (cm)
                </label>
                <input
                  {...register("vitals.height")}
                  type="text"
                  placeholder="170"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  O2 Saturation (%)
                </label>
                <input
                  {...register("vitals.oxygenSaturation", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  type="number"
                  placeholder="98"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Consultation Service Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Consultation Service (Optional)
            </label>
            <select
              value={selectedServiceId || ""}
              onChange={(e) =>
                setSelectedServiceId(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="">
                Select service (defaults to General Consultation)
              </option>
              {services?.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ₱{parseFloat(service.price).toFixed(2)}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              This determines the consultation fee for the pending payment
            </p>
          </div>

          {/* Diagnoses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Diagnosis <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                onClick={handleAddDiagnosis}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Diagnosis
              </button>
            </div>

            <div className="space-y-3">
              {diagnoses.map((diagnosis, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        ICD-10 Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={diagnosis.diagnosisCode}
                        onChange={(e) =>
                          handleDiagnosisChange(
                            index,
                            "diagnosisCode",
                            e.target.value
                          )
                        }
                        placeholder="A00.0"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Diagnosis Description{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={diagnosis.diagnosisDescription}
                        onChange={(e) =>
                          handleDiagnosisChange(
                            index,
                            "diagnosisDescription",
                            e.target.value
                          )
                        }
                        placeholder="Enter diagnosis description"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                        required
                      />
                    </div>
                  </div>
                  {diagnoses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDiagnosis(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                Medicine Prescriptions (Optional)
              </h3>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>

            {prescriptions.length > 0 && (
              <div className="space-y-3 mb-4">
                {prescriptions.map((prescription, index) => {
                  const selectedMedicine = medicines?.find(
                    (m) => m.id === prescription.medicineId
                  );
                  const availableStock = selectedMedicine?.stock || 0;

                  return (
                    <div
                      key={index}
                      className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                    >
                      {/* External Medicine Toggle */}
                      <div className="mb-3 flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prescription.isExternal}
                            onChange={(e) => {
                              handlePrescriptionChange(
                                index,
                                "isExternal",
                                e.target.checked
                              );
                              // Clear medicineId when switching to external
                              if (e.target.checked) {
                                handlePrescriptionChange(
                                  index,
                                  "medicineId",
                                  undefined
                                );
                              } else {
                                handlePrescriptionChange(
                                  index,
                                  "medicineName",
                                  ""
                                );
                              }
                            }}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            External Medicine (not in clinic inventory)
                          </span>
                        </label>
                        {prescription.isExternal && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            ℹ️ Patient will buy from external pharmacy
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            {prescription.isExternal
                              ? "Medicine Name"
                              : "Medicine"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {prescription.isExternal ? (
                            <input
                              type="text"
                              value={prescription.medicineName || ""}
                              onChange={(e) =>
                                handlePrescriptionChange(
                                  index,
                                  "medicineName",
                                  e.target.value
                                )
                              }
                              placeholder="Enter medicine name (e.g., Lipitor 20mg)"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                              required
                            />
                          ) : (
                            <>
                              <select
                                value={prescription.medicineId || 0}
                                onChange={(e) =>
                                  handlePrescriptionChange(
                                    index,
                                    "medicineId",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                                required
                              >
                                <option value={0}>Select medicine</option>
                                {medicines?.map((medicine) => (
                                  <option key={medicine.id} value={medicine.id}>
                                    {medicine.brandName || medicine.name}
                                    {medicine.genericName &&
                                      ` (${medicine.genericName})`}
                                    {medicine.specification &&
                                      ` - ${medicine.specification}`}
                                    {" - Stock: "}
                                    {medicine.stock || 0}
                                  </option>
                                ))}
                              </select>
                              {selectedMedicine &&
                                availableStock < prescription.quantity && (
                                  <p className="text-xs text-red-600 mt-1">
                                    ⚠️ Only {availableStock} available in stock
                                  </p>
                                )}
                            </>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={prescription.quantity}
                            onChange={(e) =>
                              handlePrescriptionChange(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            min="1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={prescription.dosage}
                            onChange={(e) =>
                              handlePrescriptionChange(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                            placeholder="e.g., 500mg"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={prescription.frequency}
                            onChange={(e) =>
                              handlePrescriptionChange(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                            placeholder="e.g., 3x daily"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={prescription.duration}
                            onChange={(e) =>
                              handlePrescriptionChange(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="e.g., 7 days"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Special Instructions
                          </label>
                          <input
                            type="text"
                            value={prescription.instructions}
                            onChange={(e) =>
                              handlePrescriptionChange(
                                index,
                                "instructions",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Take after meals"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prescription Notes */}
            {prescriptions.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  General Prescription Notes
                </label>
                <textarea
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional notes or warnings for all prescriptions"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Complete Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
