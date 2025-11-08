"use client";
import { X, FileText, Activity } from "lucide-react";

interface VisitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitData: {
    patientName: string;
    date: string;
    chiefComplaint?: string;
    diagnoses?: Array<{
      diagnosisCode?: string;
      diagnosisDescription: string;
    }>;
    vitals?: {
      bloodPressure?: string;
      temperature?: string;
      heartRate?: number;
      respiratoryRate?: number;
      weight?: string;
      height?: string;
      oxygenSaturation?: number;
    };
  };
}

export default function VisitDetailsModal({
  isOpen,
  onClose,
  visitData,
}: VisitDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Visit Details</h2>
            <p className="text-sm text-slate-500 mt-1">
              Patient:{" "}
              <span className="font-medium">{visitData.patientName}</span>
              {" • "}
              {new Date(visitData.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Chief Complaint */}
          {visitData.chiefComplaint && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Chief Complaint
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700">{visitData.chiefComplaint}</p>
              </div>
            </div>
          )}

          {/* Diagnoses */}
          {visitData.diagnoses && visitData.diagnoses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Diagnosis
              </h3>
              <div className="space-y-3">
                {visitData.diagnoses.map((diagnosis, index) => (
                  <div
                    key={index}
                    className="p-4 bg-teal-50 rounded-lg border border-teal-200"
                  >
                    {diagnosis.diagnosisCode && (
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded">
                          ICD-10: {diagnosis.diagnosisCode}
                        </span>
                      </div>
                    )}
                    <p className="text-slate-800 font-medium">
                      {diagnosis.diagnosisDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vital Signs */}
          {visitData.vitals &&
            Object.keys(visitData.vitals).some(
              (key) => visitData.vitals![key as keyof typeof visitData.vitals]
            ) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {visitData.vitals.bloodPressure && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Blood Pressure
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {visitData.vitals.bloodPressure}
                      </p>
                      <p className="text-xs text-slate-500">mmHg</p>
                    </div>
                  )}
                  {visitData.vitals.temperature && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Temperature
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {visitData.vitals.temperature}
                      </p>
                      <p className="text-xs text-slate-500">°C</p>
                    </div>
                  )}
                  {visitData.vitals.heartRate && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Heart Rate
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {visitData.vitals.heartRate}
                      </p>
                      <p className="text-xs text-slate-500">bpm</p>
                    </div>
                  )}
                  {visitData.vitals.respiratoryRate && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Respiratory Rate
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {visitData.vitals.respiratoryRate}
                      </p>
                      <p className="text-xs text-slate-500">/min</p>
                    </div>
                  )}
                  {visitData.vitals.weight && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Weight
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {visitData.vitals.weight}
                      </p>
                      <p className="text-xs text-slate-500">kg</p>
                    </div>
                  )}
                  {visitData.vitals.height && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Height
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {visitData.vitals.height}
                      </p>
                      <p className="text-xs text-slate-500">cm</p>
                    </div>
                  )}
                  {visitData.vitals.oxygenSaturation && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        O2 Saturation
                      </p>
                      <p className="text-lg font-bold text-slate-800">
                        {visitData.vitals.oxygenSaturation}
                      </p>
                      <p className="text-xs text-slate-500">%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* No Data Message */}
          {!visitData.chiefComplaint &&
            (!visitData.diagnoses || visitData.diagnoses.length === 0) &&
            (!visitData.vitals ||
              !Object.keys(visitData.vitals).some(
                (key) => visitData.vitals![key as keyof typeof visitData.vitals]
              )) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Details Available
                </h3>
                <p className="text-slate-500 text-sm">
                  No diagnosis or vital signs were recorded for this visit.
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
