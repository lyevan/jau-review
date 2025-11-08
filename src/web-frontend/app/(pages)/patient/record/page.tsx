"use client";
import {
  FileText,
  Calendar,
  User,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  useGetMedicalRecord,
  useGetVisits,
} from "@/app/_hooks/queries/useMedicalRecords";

export default function PatientRecordPage() {
  const {
    data: medicalRecord,
    isLoading: recordLoading,
    error: recordError,
  } = useGetMedicalRecord();
  const {
    data: visits,
    isLoading: visitsLoading,
    error: visitsError,
  } = useGetVisits();

  // Loading state
  if (recordLoading || visitsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading medical records...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (recordError || visitsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Error loading medical records
          </h3>
          <p className="text-slate-500 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            My Medical Record
          </h1>
          <p className="text-slate-600">
            View your medical history and visit records
          </p>
        </div>

        {/* Medical Record Card */}
        {medicalRecord && (
          <div className="bg-white shadow-sm rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-teal-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  {medicalRecord.firstName} {medicalRecord.lastName}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Age</p>
                      <p className="font-semibold text-slate-700">
                        {medicalRecord.age || "Not specified"} years
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Birth Date</p>
                      <p className="font-semibold text-slate-700">
                        {medicalRecord.birthDate
                          ? new Date(
                              medicalRecord.birthDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Contact</p>
                      <p className="font-semibold text-slate-700">
                        {medicalRecord.contactNumber || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-semibold text-slate-700">
                        {medicalRecord.address || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Medical History
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Past Medical History (PMHX)
                      </p>
                      <p className="text-slate-600">
                        {medicalRecord.pmhx ||
                          "No past medical history recorded"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Family History (FMHX)
                      </p>
                      <p className="text-slate-600">
                        {medicalRecord.fmhx || "No family history recorded"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Past Surgical History (PSHX)
                      </p>
                      <p className="text-slate-600">
                        {medicalRecord.pshx ||
                          "No past surgical history recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visit History */}
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Visit History
              </h2>
              <p className="text-sm text-slate-600">
                {visits?.length || 0} total visits
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
          </div>

          {visits && visits.length > 0 ? (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {new Date(visit.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(visit.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        visit.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : visit.status === "scheduled"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {visit.status.charAt(0).toUpperCase() +
                        visit.status.slice(1)}
                    </span>
                  </div>

                  {visit.chiefComplaint && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-700 mb-1">
                        Reason for Visit
                      </p>
                      <p className="text-slate-600">{visit.chiefComplaint}</p>
                    </div>
                  )}

                  {/* Diagnoses */}
                  {(visit as any).diagnoses &&
                    (visit as any).diagnoses.length > 0 && (
                      <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <p className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Diagnosis
                        </p>
                        <div className="space-y-2">
                          {(visit as any).diagnoses.map(
                            (diagnosis: any, index: number) => (
                              <div key={index} className="flex gap-2">
                                <span className="text-teal-700 font-medium">
                                  •
                                </span>
                                <p className="text-slate-700">
                                  {diagnosis.diagnosisDescription}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Vital Signs */}
                  {(visit as any).vitals && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Vital Signs
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(visit as any).vitals.bloodPressure && (
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              Blood Pressure
                            </p>
                            <p className="font-semibold text-slate-800">
                              {(visit as any).vitals.bloodPressure} mmHg
                            </p>
                          </div>
                        )}
                        {(visit as any).vitals.temperature && (
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              Temperature
                            </p>
                            <p className="font-semibold text-slate-800">
                              {(visit as any).vitals.temperature}°C
                            </p>
                          </div>
                        )}
                        {(visit as any).vitals.heartRate && (
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              Heart Rate
                            </p>
                            <p className="font-semibold text-slate-800">
                              {(visit as any).vitals.heartRate} bpm
                            </p>
                          </div>
                        )}
                        {(visit as any).vitals.respiratoryRate && (
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              Resp. Rate
                            </p>
                            <p className="font-semibold text-slate-800">
                              {(visit as any).vitals.respiratoryRate}/min
                            </p>
                          </div>
                        )}
                        {(visit as any).vitals.weight && (
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              Weight
                            </p>
                            <p className="font-semibold text-slate-800">
                              {(visit as any).vitals.weight} kg
                            </p>
                          </div>
                        )}
                        {(visit as any).vitals.height && (
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              Height
                            </p>
                            <p className="font-semibold text-slate-800">
                              {(visit as any).vitals.height} cm
                            </p>
                          </div>
                        )}
                        {(visit as any).vitals.oxygenSaturation && (
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">
                              O2 Saturation
                            </p>
                            <p className="font-semibold text-slate-800">
                              {(visit as any).vitals.oxygenSaturation}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No visits yet
              </h3>
              <p className="text-slate-500 text-sm">
                Your visit history will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
