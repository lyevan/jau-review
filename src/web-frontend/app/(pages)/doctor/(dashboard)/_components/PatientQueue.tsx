"use client";

import { useState } from "react";
import { Phone, Check, Clock, CheckCircle, XCircle, User, Edit } from "lucide-react";

export type PatientStatus = "waiting" | "ongoing" | "done" | "cancelled";

export interface Patient {
  id: string;
  name: string;
  appointmentTime: string;
  status: PatientStatus;
  age?: number;
  gender?: string;
  familyHistory?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  hasSoapNotes?: boolean;
}

interface PatientQueueProps {
  onCallPatient?: (patient: Patient) => void;
  onEditSoap?: (patient: Patient) => void;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

export default function PatientQueue({ onCallPatient, onEditSoap, patients, setPatients }: PatientQueueProps) {
  const handleCall = (id: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "ongoing" }
          : p.status === "ongoing"
          ? { ...p, status: "waiting" }
          : p
      )
    );

    const patient = patients.find((p) => p.id === id);
    if (patient && onCallPatient) onCallPatient(patient);
  };

  const getStatusBadge = (status: PatientStatus) => {
    const configs = {
      waiting: {
        bg: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock className="w-3 h-3" />,
        label: "Waiting"
      },
      ongoing: {
        bg: "bg-teal-100 text-teal-700 border-teal-200",
        icon: <Phone className="w-3 h-3" />,
        label: "Ongoing"
      },
      done: {
        bg: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Completed"
      },
      cancelled: {
        bg: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle className="w-3 h-3" />,
        label: "Cancelled"
      },
    };

    const config = configs[status];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Patient Queue</h2>
        <p className="text-sm text-slate-600 mt-1">
          {patients.filter(p => p.status === "waiting").length} patients waiting
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Time</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Age</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Gender</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {patient.appointmentTime}
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-700">{patient.age}</td>
                <td className="px-6 py-4 text-center text-slate-700">{patient.gender}</td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(patient.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {patient.status === "waiting" && (
                      <button
                        onClick={() => handleCall(patient.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                      >
                        <Phone size={14} />
                        Call
                      </button>
                    )}
                    {patient.status === "ongoing" && (
                      <button
                        onClick={() => onEditSoap && onEditSoap(patient)}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Edit size={14} />
                        {patient.hasSoapNotes ? "Edit SOAP" : "Add SOAP"}
                      </button>
                    )}
                    {patient.status === "done" && (
                      <span className="text-sm text-slate-500 italic">Completed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}