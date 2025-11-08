// app/doctor/dashboard/_components/PatientDetails.tsx
"use client";

import { Patient } from "./PatientQueue";
import { X } from "lucide-react";

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientDetails({ patient, onClose }: PatientDetailProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Patient Details</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          <X size={20} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p><strong>ID:</strong> {patient.id}</p>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Appointment Time:</strong> {patient.appointmentTime}</p>
        </div>
        <div>
          {/* Placeholder for patient photo */}
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
            Photo
          </div>
        </div>
      </div>
    </div>
  );
}
