"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Activity,
  FileText,
  TrendingUp,
  Heart,
  Wind,
  Droplets,
  Pill,
} from "lucide-react";
import { useGetUserById } from "@/app/_hooks/queries/useUsers";
import { useGetPrescriptions } from "@/app/_hooks/queries/usePrescriptions";
import PrescriptionModal from "@/app/_components/PrescriptionModal";
import { useSession } from "next-auth/react";

interface Visit {
  id: number;
  date: string;
  weight: number;
  height: number;
  bp: string;
  pr: number;
  rr: number;
  o2Sat: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface PatientDetails {
  id: string;
  name: string;
  age: number;
  gender: string;
  familyHistory: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  photo?: string;
  visits: Visit[];
}

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [patientProfileId, setPatientProfileId] = useState<number | undefined>(
    undefined
  );
  const [prescriptionModal, setPrescriptionModal] = useState<{
    prescription: any;
    patientName: string;
    doctorName: string;
  } | null>(null);

  // Fetch user data from backend
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useGetUserById(id ? parseInt(id) : 0);

  // Fetch all prescriptions for this patient using patient profile ID
  const { data: prescriptions = [] } = useGetPrescriptions({
    patientId: patientProfileId,
  });

  useEffect(() => {
    if (user) {
      // Set patient profile ID for prescription fetching
      if (user.profile?.id) {
        setPatientProfileId(user.profile.id);
      }

      const medicalRecord = user.medicalRecord;
      const visits = user.visits || [];

      setPatient({
        id: user.id.toString(),
        name: `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim(),
        age: user.age || 0,
        gender: user.gender || "N/A",
        photo:
          user.profilePicture || user.profile_picture || "/assets/patient.jpg",
        familyHistory: medicalRecord?.fmhx || "None recorded",
        pastMedicalHistory: medicalRecord?.pmhx || "None recorded",
        pastSurgicalHistory: medicalRecord?.pshx || "None recorded",
        visits: visits.map((visit: any) => ({
          id: visit.id,
          date: new Date(visit.date).toISOString().split("T")[0],
          weight: visit.vitals?.weight ? parseFloat(visit.vitals.weight) : 0,
          height: visit.vitals?.height ? parseFloat(visit.vitals.height) : 0,
          bp: visit.vitals?.bloodPressure || "N/A",
          pr: visit.vitals?.heartRate || 0,
          rr: visit.vitals?.respiratoryRate || 0,
          o2Sat: visit.vitals?.oxygenSaturation || 0,
          subjective: visit.chiefComplaint || "N/A",
          objective: visit.vitals
            ? `Temp: ${visit.vitals.temperature || "N/A"}°C`
            : "N/A",
          assessment:
            visit.diagnoses
              ?.map((d: any) => d.diagnosisDescription)
              .join(", ") || "N/A",
          plan: "See consultation notes",
        })),
      });
    }
  }, [user]);

  // Helper to find prescription for a visit
  const getPrescriptionForVisit = (visitId: number) => {
    return prescriptions?.find((p: any) => p.visitId === visitId);
  };

  // Handle view prescription
  const handleViewPrescription = (visit: Visit) => {
    const prescription = getPrescriptionForVisit(visit.id);
    if (prescription) {
      setPrescriptionModal({
        prescription,
        patientName: patient?.name || "",
        doctorName: "Dr. [Doctor Name]",
      });
    }
  };

  if (userLoading || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Patient Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            The patient you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/doctor/patients")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patient List
          </button>
        </div>
      </div>
    );
  }

  const latestVisit = patient.visits[patient.visits.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/doctor/patient"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient List
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center shadow-md">
                {patient.photo ? (
                  <img
                    src={patient.photo}
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-teal-600" />
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-1">
                    {patient.name}
                  </h1>
                  <p className="text-slate-600 font-mono text-sm">
                    ID: {patient.id}
                  </p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                  Active Patient
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Age</p>
                    <p className="font-semibold text-slate-800">
                      {patient.age} years
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gender</p>
                    <p className="font-semibold text-slate-800">
                      {patient.gender}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Visits</p>
                    <p className="font-semibold text-slate-800">
                      {patient.visits.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Vitals */}
        {latestVisit && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-sm text-slate-600">Blood Pressure</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {latestVisit.bp}
              </p>
              <p className="text-xs text-slate-500 mt-1">mmHg</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-pink-600" />
                </div>
                <p className="text-sm text-slate-600">Pulse Rate</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {latestVisit.pr}
              </p>
              <p className="text-xs text-slate-500 mt-1">bpm</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wind className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600">Respiratory</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {latestVisit.rr}
              </p>
              <p className="text-xs text-slate-500 mt-1">breaths/min</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                </div>
                <p className="text-sm text-slate-600">O2 Saturation</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {latestVisit.o2Sat}%
              </p>
              <p className="text-xs text-slate-500 mt-1">SpO2</p>
            </div>
          </div>
        )}

        {/* Medical History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-slate-800">Family History</h3>
            </div>
            <p className="text-slate-600">{patient.familyHistory}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-slate-800">
                Past Medical History
              </h3>
            </div>
            <p className="text-slate-600">{patient.pastMedicalHistory}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-slate-800">
                Past Surgical History
              </h3>
            </div>
            <p className="text-slate-600">{patient.pastSurgicalHistory}</p>
          </div>
        </div>

        {/* Visit Records */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-slate-800">
                Visit History
              </h2>
            </div>
          </div>

          {patient.visits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      Weight
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      Height
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      BP
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      PR
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      RR
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      O2 Sat
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Subjective
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Objective
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Assessment
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {patient.visits.map((visit, idx) => {
                    const prescription = getPrescriptionForVisit(visit.id);
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-slate-800">
                          {new Date(visit.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-700">
                          {visit.weight} kg
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-700">
                          {visit.height} cm
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-700">
                          {visit.bp}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-700">
                          {visit.pr}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-700">
                          {visit.rr}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-700">
                          {visit.o2Sat}%
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                          {visit.subjective}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                          {visit.objective}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                          {visit.assessment}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                          {visit.plan}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {prescription ? (
                            <button
                              onClick={() => handleViewPrescription(visit)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-medium transition-colors border border-teal-200"
                            >
                              <Pill className="w-4 h-4" />
                              View Rx
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No prescription
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No visit records
              </h3>
              <p className="text-slate-500 text-sm">
                This patient hasn't had any visits yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Modal */}
      {prescriptionModal && (
        <PrescriptionModal
          prescription={prescriptionModal.prescription}
          patientName={prescriptionModal.patientName}
          doctorName={prescriptionModal.doctorName}
          onClose={() => setPrescriptionModal(null)}
        />
      )}
    </div>
  );
}
