"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  User,
  Calendar,
  FileText,
  ArrowLeft,
  Activity,
  Heart,
  Wind,
  Droplets,
  Weight,
  Ruler,
  UserCheck,
  UserX,
  Eye,
  X,
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
  o2: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: "active" | "inactive";
  image: string;
  familyHistory: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  visits: Visit[];
}

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [id, setId] = useState<string>("");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [patientProfileId, setPatientProfileId] = useState<number | undefined>(
    undefined
  );
  const [prescriptionModal, setPrescriptionModal] = useState<{
    prescription: any;
    patientName: string;
    doctorName: string;
  } | null>(null);

  // Fetch all prescriptions for this patient using patient profile ID
  const { data: prescriptions = [] } = useGetPrescriptions({
    patientId: patientProfileId,
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Fetch user data from backend
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useGetUserById(id ? parseInt(id) : 0);

  useEffect(() => {
    if (user) {
      console.log("👤 User data received:", user);

      // Set patient profile ID for prescription fetching
      if (user.profile?.id) {
        setPatientProfileId(user.profile.id);
      }

      // Transform backend user data to Patient format
      const medicalRecord = user.medicalRecord;
      const visits = user.visits || [];

      setPatient({
        id: user.id.toString(),
        name: `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim(),
        age: user.age || 0,
        gender: user.gender || "N/A",
        status: (user.isActive ?? user.is_active) ? "active" : "inactive",
        image:
          user.profilePicture || user.profile_picture || "/assets/patient.jpg",
        familyHistory: medicalRecord?.fmhx || "",
        pastMedicalHistory: medicalRecord?.pmhx || "",
        pastSurgicalHistory: medicalRecord?.pshx || "",
        visits: visits.map((visit: any) => ({
          id: visit.id,
          date: new Date(visit.date).toISOString().split("T")[0],
          weight: visit.vitals?.weight ? parseFloat(visit.vitals.weight) : 0,
          height: visit.vitals?.height ? parseFloat(visit.vitals.height) : 0,
          bp: visit.vitals?.bloodPressure || "N/A",
          pr: visit.vitals?.heartRate || 0,
          rr: visit.vitals?.respiratoryRate || 0,
          o2: visit.vitals?.oxygenSaturation || 0,
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
        doctorName: "Dr. [Doctor Name]", // Will be included in prescription data
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

  const getStatusBadge = (status: Patient["status"]) => {
    const config =
      status === "active"
        ? {
            bg: "bg-green-100 text-green-700 border-green-200",
            icon: <UserCheck className="w-4 h-4" />,
          }
        : {
            bg: "bg-gray-100 text-gray-700 border-gray-200",
            icon: <UserX className="w-4 h-4" />,
          };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.bg}`}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Patient List
        </button>

        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <Image
                src={patient.image}
                alt={patient.name}
                width={120}
                height={120}
                className="rounded-full border-4 border-teal-100 object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-1">
                    {patient.name}
                  </h1>
                  <p className="text-slate-500 font-mono">{patient.id}</p>
                </div>
                {getStatusBadge(patient.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Age</p>
                  <p className="font-semibold text-slate-800">
                    {patient.age} years
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Gender</p>
                  <p className="font-semibold text-slate-800">
                    {patient.gender}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Total Visits</p>
                  <p className="font-semibold text-slate-800">
                    {patient.visits.length}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Last Visit</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(patient.visits[0].date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History - Only show if there's actual data */}
        {(patient.familyHistory ||
          patient.pastMedicalHistory ||
          patient.pastSurgicalHistory) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-800">
                Medical History
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patient.familyHistory && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-slate-800 text-sm">
                      Family History
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    {patient.familyHistory}
                  </p>
                </div>
              )}

              {patient.pastMedicalHistory && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-800 text-sm">
                      Medical History
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    {patient.pastMedicalHistory}
                  </p>
                </div>
              )}

              {patient.pastSurgicalHistory && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-slate-800 text-sm">
                      Surgical History
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    {patient.pastSurgicalHistory}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visit Records Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-slate-800">
                  Visit Records
                </h2>
              </div>
              <span className="text-sm text-slate-600">
                {patient.visits.length} total visits
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Chief Complaint
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Diagnosis
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    Vitals
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    Action
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {new Date(visit.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              Visit #{patient.visits.length - idx}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {visit.subjective}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {visit.assessment}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {visit.bp !== "N/A" && visit.pr > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Recorded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            None
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedVisit(visit)}
                            className="p-2 hover:bg-teal-50 rounded-lg transition-colors group"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5 text-slate-600 group-hover:text-teal-600" />
                          </button>
                          {prescription && (
                            <button
                              onClick={() => handleViewPrescription(visit)}
                              className="p-2 hover:bg-purple-50 rounded-lg transition-colors group"
                              title="View Prescription"
                            >
                              <Pill className="w-5 h-5 text-slate-600 group-hover:text-purple-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visit Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-2xl">
              <button
                onClick={() => setSelectedVisit(null)}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Visit Details</h3>
                  <p className="text-teal-100 text-sm">
                    {new Date(selectedVisit.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Vital Signs */}
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4">
                  Vital Signs
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Weight className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Weight
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedVisit.weight} kg
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Height
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedVisit.height} cm
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Blood Pressure
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedVisit.bp}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Pulse Rate
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedVisit.pr} bpm
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        Respiratory Rate
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedVisit.rr} /min
                    </p>
                  </div>

                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-semibold text-slate-700">
                        O₂ Saturation
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedVisit.o2}%
                    </p>
                  </div>
                </div>
              </div>

              {/* SOAP Notes */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-800">SOAP Notes</h4>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-800 mb-2">
                    Subjective
                  </h5>
                  <p className="text-slate-600">{selectedVisit.subjective}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-800 mb-2">
                    Objective
                  </h5>
                  <p className="text-slate-600">{selectedVisit.objective}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-800 mb-2">
                    Assessment
                  </h5>
                  <p className="text-slate-600">{selectedVisit.assessment}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-800 mb-2">Plan</h5>
                  <p className="text-slate-600">{selectedVisit.plan}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
