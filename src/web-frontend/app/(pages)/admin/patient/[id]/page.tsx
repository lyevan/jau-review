"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  FileText,
  ArrowLeft,
  Heart,
  Activity,
  Wind,
  Droplets,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Pill,
} from "lucide-react";
import Link from "next/link";
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
  email?: string;
  phone?: string;
  address?: string;
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
      console.log("👤 User profile:", user.profile);
      console.log("👤 User profile ID:", user.profile?.id);

      // Set patient profile ID for prescription fetching
      if (user.profile?.id) {
        console.log("✅ Setting patient profile ID:", user.profile.id);
        setPatientProfileId(user.profile.id);
      } else {
        console.error("❌ No profile ID found for user:", user.id);
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
        email: user.email || "N/A",
        phone: user.contactNumber || user.contact_number || "N/A",
        address: user.profile?.address || medicalRecord?.address || "N/A",
        familyHistory: medicalRecord?.fmhx || "",
        pastMedicalHistory: medicalRecord?.pmhx || "",
        pastSurgicalHistory: medicalRecord?.pshx || "",
        visits: visits.map((visit: any) => {
          console.log("📅 Mapping visit:", visit.id, "Date:", visit.date);
          return {
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
          };
        }),
      });
    }
  }, [user]);

  // Log prescription data for debugging
  useEffect(() => {
    console.log(
      "📋 Patient Profile ID for prescription query:",
      patientProfileId
    );
    console.log("📋 Prescriptions fetched count:", prescriptions?.length || 0);
    console.log("📋 Prescriptions data:", prescriptions);
    if (prescriptions && prescriptions.length > 0) {
      prescriptions.forEach((p: any) => {
        console.log(
          `  - Prescription ID ${p.id}: visitId=${p.visitId}, patientId=${p.patientId}, status=${p.status}`
        );
      });
    }
  }, [patientProfileId, prescriptions]);

  // Helper to find prescription for a visit
  const getPrescriptionForVisit = (visitId: number) => {
    const found = prescriptions?.find((p: any) => p.visitId === visitId);
    console.log(
      `🔍 Looking for prescription for visit ${visitId}:`,
      found ? `Found ID ${found.id}` : "Not found"
    );
    return found;
  };

  // Handle view prescription
  const handleViewPrescription = (visit: Visit) => {
    const prescription = getPrescriptionForVisit(visit.id);
    if (prescription) {
      const doctorName =
        prescription.doctorFirstName && prescription.doctorLastName
          ? `Dr. ${prescription.doctorFirstName} ${prescription.doctorLastName}`
          : "Dr. [Unknown]";

      setPrescriptionModal({
        prescription,
        patientName: patient?.name || "",
        doctorName,
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

  const latestVisit = patient.visits[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/admin/patient"
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
                {patient.image ? (
                  <img
                    src={patient.image}
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
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    patient.status === "active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {patient.status === "active" ? "● Active" : "● Inactive"}
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

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  {patient.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Vitals - Only show if there's actual visit data */}
        {latestVisit && latestVisit.bp !== "N/A" && (
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
                {latestVisit.o2}%
              </p>
              <p className="text-xs text-slate-500 mt-1">SpO2</p>
            </div>
          </div>
        )}

        {/* Medical History - Only show if there's actual data */}
        {(patient.familyHistory ||
          patient.pastMedicalHistory ||
          patient.pastSurgicalHistory) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {patient.familyHistory && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-slate-800">
                    Family History
                  </h3>
                </div>
                <p className="text-slate-600">{patient.familyHistory}</p>
              </div>
            )}

            {patient.pastMedicalHistory && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-slate-800">
                    Past Medical History
                  </h3>
                </div>
                <p className="text-slate-600">{patient.pastMedicalHistory}</p>
              </div>
            )}

            {patient.pastSurgicalHistory && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-slate-800">
                    Past Surgical History
                  </h3>
                </div>
                <p className="text-slate-600">{patient.pastSurgicalHistory}</p>
              </div>
            )}
          </div>
        )}

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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Chief Complaint
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Diagnosis
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                      Vitals Recorded
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
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {visit.subjective}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {visit.assessment}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {visit.bp !== "N/A" && visit.pr > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {prescription ? (
                            <button
                              onClick={() => handleViewPrescription(visit)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-medium transition-colors border border-teal-200"
                            >
                              <Pill className="w-4 h-4" />
                              View Prescription
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
