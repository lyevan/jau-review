"use client";

import { useState, useEffect } from "react";
import { Patient } from "./PatientQueue";
import { X, Save, User, Activity, Heart, FileText } from "lucide-react";
import { toast } from "@/app/_utils/toast";

interface SoapEditorProps {
  patient: Patient;
  onClose: () => void;
  onSave: (patientId: string, soapData: SoapData) => void;
}

export interface SoapData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export default function SoapEditor({
  patient,
  onClose,
  onSave,
}: SoapEditorProps) {
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  const handleSave = () => {
    if (!subjective || !objective || !assessment || !plan) {
      toast.warning("Please fill in all SOAP fields before saving.");
      return;
    }

    const soapData: SoapData = {
      subjective,
      objective,
      assessment,
      plan,
    };

    onSave(patient.id, soapData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">SOAP Notes</h2>
              <p className="text-teal-100 text-sm">
                {patient.name} - {patient.id}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Details */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Age</p>
                <p className="font-semibold text-slate-800">
                  {patient.age} years
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Gender</p>
                <p className="font-semibold text-slate-800">{patient.gender}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Appointment</p>
                <p className="font-semibold text-slate-800">
                  {patient.appointmentTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Status</p>
                <p className="font-semibold text-teal-600">Ongoing</p>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-slate-800 text-sm">
                  Family History
                </h4>
              </div>
              <p className="text-sm text-slate-600">
                {patient.familyHistory || "No data"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-slate-800 text-sm">
                  Medical History
                </h4>
              </div>
              <p className="text-sm text-slate-600">
                {patient.pastMedicalHistory || "No data"}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-slate-800 text-sm">
                  Surgical History
                </h4>
              </div>
              <p className="text-sm text-slate-600">
                {patient.pastSurgicalHistory || "No data"}
              </p>
            </div>
          </div>

          {/* SOAP Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subjective <span className="text-red-600">*</span>
              </label>
              <textarea
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px]"
                placeholder="Patient's description of symptoms, complaints, and concerns..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Objective <span className="text-red-600">*</span>
              </label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px]"
                placeholder="Observable and measurable data (vitals, physical examination findings)..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Assessment <span className="text-red-600">*</span>
              </label>
              <textarea
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px]"
                placeholder="Diagnosis, interpretation, and clinical impression..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Plan <span className="text-red-600">*</span>
              </label>
              <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px]"
                placeholder="Treatment plan, medications, follow-up instructions..."
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save & Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
