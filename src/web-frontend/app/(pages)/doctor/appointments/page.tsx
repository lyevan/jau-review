"use client";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  User,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Eye,
} from "lucide-react";
import {
  useGetAppointments,
  useGetConflicts,
  useRequestReschedule,
} from "@/app/_hooks/queries/useAppointments";
import { useUpdateAppointment } from "@/app/_hooks/mutations/useAppointments";
import {
  useCreateVisit,
  useGetVisitByAppointment,
} from "@/app/_hooks/mutations/useVisits";
import DiagnosisModal from "@/app/_components/DiagnosisModal";
import VisitDetailsModal from "@/app/_components/VisitDetailsModal";
import PrescriptionModal from "@/app/_components/PrescriptionModal";
import { CreateVisitSchema } from "@/app/_schema/visit.schema";

export default function DoctorAppointmentsPage() {
  const { data: session } = useSession();
  const { data: appointments, isLoading, error } = useGetAppointments();
  const { data: conflicts } = useGetConflicts();
  const updateAppointment = useUpdateAppointment();
  const requestRescheduleMutation = useRequestReschedule();
  const createVisit = useCreateVisit();

  const [filterStatus, setFilterStatus] = useState<
    | "all"
    | "pending"
    | "confirmed"
    | "arrived"
    | "completed"
    | "cancelled"
    | "reschedule_requested"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rescheduleModal, setRescheduleModal] = useState<{
    appointmentId: number;
    patientName: string;
    currentDate: string;
    currentTime: string;
  } | null>(null);
  const [diagnosisModal, setDiagnosisModal] = useState<{
    id: number;
    patientId: number;
    patientName: string;
    reason?: string;
  } | null>(null);
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    appointmentId: number;
    patientName: string;
    date: string;
  } | null>(null);
  const [prescriptionModal, setPrescriptionModal] = useState<{
    prescription: any;
    patientName: string;
    doctorName: string;
  } | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [reasonType, setReasonType] = useState<string>("conflict");

  // Fetch visit details when view modal is opened
  const { data: visitDetails, isLoading: visitDetailsLoading } =
    useGetVisitByAppointment(viewDetailsModal?.appointmentId || null);

  // Common reschedule reasons
  const rescheduleReasons = [
    { value: "conflict", label: "Scheduling conflict with another patient" },
    { value: "emergency", label: "Emergency case needs immediate attention" },
    { value: "personal", label: "Personal/unavoidable commitment" },
    {
      value: "double_booking",
      label: "Double booking - multiple requests for same slot",
    },
    { value: "medical", label: "Medical procedure/surgery scheduled" },
    { value: "other", label: "Other (specify below)" },
  ];

  const handleStatusUpdate = (
    appointmentId: number,
    newStatus: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    updateAppointment.mutate(
      { appointmentId, data: { status: newStatus } },
      {
        onSuccess: () => {
          // Success will trigger React Query refetch
        },
        onError: (error: any) => {
          console.error("Failed to update appointment:", error);
        },
      }
    );
  };

  const handleCompleteAppointment = (appointment: any) => {
    // Open diagnosis modal instead of directly updating status
    setDiagnosisModal({
      id: appointment.id,
      patientId: appointment.patient?.id || 0,
      patientName: `${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
      reason: appointment.reason,
    });
  };

  const handleDiagnosisSubmit = (data: CreateVisitSchema) => {
    console.log("\n========================================");
    console.log("📋 DIAGNOSIS MODAL SUBMITTED");
    console.log("========================================");
    console.log("Full data:", JSON.stringify(data, null, 2));
    console.log("Patient ID:", data.patientId);
    console.log("Prescriptions:", data.prescriptions);
    console.log("Prescription count:", data.prescriptions?.length || 0);
    console.log("Prescription notes:", data.prescriptionNotes);
    console.log("========================================\n");

    // Create visit record with diagnosis and vitals
    createVisit.mutate(data, {
      onSuccess: (response: any) => {
        // After creating visit, update appointment status to completed
        updateAppointment.mutate(
          { appointmentId: data.appointmentId!, data: { status: "completed" } },
          {
            onSuccess: () => {
              setDiagnosisModal(null);
              console.log("✅ Appointment completed with diagnosis and vitals");

              console.log("\n========================================");
              console.log("📋 Checking prescription in response:");
              console.log("========================================");
              console.log("Full response:", JSON.stringify(response, null, 2));
              console.log("response.prescription:", response?.prescription);
              console.log("========================================\n");

              // If prescription was created, show prescription modal
              if (response?.prescription) {
                console.log(
                  "🔔 Opening prescription modal with data:",
                  response.prescription
                );
                setPrescriptionModal({
                  prescription: response.prescription,
                  patientName: diagnosisModal?.patientName || "",
                  doctorName: `Dr. ${session?.user?.first_name || ""} ${session?.user?.last_name || ""}`,
                });
              } else {
                console.warn(
                  "⚠️ No prescription in response, modal will not open"
                );
              }
            },
            onError: (error: any) => {
              console.error("Failed to update appointment status:", error);
              setDiagnosisModal(null);
            },
          }
        );
      },
      onError: (error: any) => {
        console.error("Failed to create visit record:", error);
        alert("Failed to save diagnosis. Please try again.");
      },
    });
  };

  const handleRequestReschedule = () => {
    if (!rescheduleModal || !proposedDate || !proposedTime) {
      return;
    }

    // Get the reason text
    let finalReason = rescheduleReason.trim();
    if (reasonType !== "other") {
      const selectedReason = rescheduleReasons.find(
        (r) => r.value === reasonType
      );
      finalReason = selectedReason?.label || rescheduleReason;
      if (rescheduleReason.trim()) {
        finalReason += `. ${rescheduleReason}`;
      }
    }

    if (!finalReason) {
      return;
    }

    requestRescheduleMutation.mutate(
      {
        id: rescheduleModal.appointmentId,
        reason: finalReason,
        proposedDate: proposedDate,
        proposedStartTime: proposedTime,
      },
      {
        onSuccess: () => {
          setRescheduleModal(null);
          setRescheduleReason("");
          setProposedDate("");
          setProposedTime("");
          setReasonType("conflict");
        },
        onError: (error: any) => {
          console.error("Failed to request reschedule:", error);
        },
      }
    );
  };

  const filteredAppointments = appointments?.filter((appt) => {
    const matchesStatus =
      filterStatus === "all" || appt.status === filterStatus;
    const matchesSearch =
      appt.patient?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appt.patient?.lastName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appt.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "reschedule_requested":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "arrived":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "reschedule_requested":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const stats = {
    total: appointments?.length || 0,
    pending: appointments?.filter((a) => a.status === "pending").length || 0,
    confirmed:
      appointments?.filter((a) => a.status === "confirmed").length || 0,
    completed:
      appointments?.filter((a) => a.status === "completed").length || 0,
    cancelled:
      appointments?.filter((a) => a.status === "cancelled").length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
          <p className="text-slate-600 text-lg">Failed to load appointments</p>
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
            My Appointments
          </h1>
          <p className="text-slate-600">
            Manage your patient appointments and consultations
          </p>
        </div>

        {/* Conflicts Alert */}
        {conflicts && conflicts.length > 0 && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-orange-800">
                  Appointment Conflicts Detected
                </h3>
                <p className="text-sm text-orange-700">
                  Multiple patients have requested the same time slots. Please
                  review and request reschedule for non-priority appointments.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {conflicts.map((conflict, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg border border-orange-200 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-slate-800">
                      {new Date(conflict.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-slate-600">at</span>
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-slate-800">
                      {conflict.startTime}
                    </span>
                    <span className="ml-auto bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                      {conflict.count} conflicts
                    </span>
                  </div>

                  <div className="space-y-2">
                    {conflict.appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          appt.priority === 1
                            ? "bg-green-50 border-green-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              appt.priority === 1
                                ? "bg-green-600 text-white"
                                : "bg-slate-400 text-white"
                            }`}
                          >
                            {appt.priority}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {appt.patient?.firstName} {appt.patient?.lastName}
                            </p>
                            <p className="text-xs text-slate-600">
                              Requested:{" "}
                              {new Date(appt.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {appt.priority === 1 && (
                            <span className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                              First Requester
                            </span>
                          )}
                        </div>

                        {appt.priority !== 1 &&
                          appt.status !== "reschedule_requested" && (
                            <button
                              onClick={() => {
                                setRescheduleModal({
                                  appointmentId: appt.id,
                                  patientName: `${appt.patient?.firstName} ${appt.patient?.lastName}`,
                                  currentDate: appt.date,
                                  currentTime: appt.startTime,
                                });
                                // Set initial proposed date/time to tomorrow at same time
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                setProposedDate(
                                  tomorrow.toISOString().split("T")[0]
                                );
                                setProposedTime(appt.startTime);
                              }}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Request Reschedule
                            </button>
                          )}

                        {appt.status === "reschedule_requested" && (
                          <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                            Reschedule Requested
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Pending</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Confirmed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.confirmed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Completed</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Cancelled</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.cancelled}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient name or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="arrived">Arrived</option>
                <option value="reschedule_requested">
                  Reschedule Requested
                </option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments && filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {appointment.patient?.firstName}{" "}
                          {appointment.patient?.lastName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Patient ID: {appointment.patient?.id}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span className="text-sm">
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span className="text-sm">{appointment.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-teal-600" />
                        <span className="text-sm capitalize">Patient</span>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold">Reason:</span>{" "}
                          {appointment.reason}
                        </p>
                      </div>
                    )}

                    {appointment.status === "cancelled" &&
                      appointment.cancellationReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-red-800 text-sm">
                                Cancellation Reason
                              </h4>
                              <p className="text-red-700 text-sm mt-1">
                                {appointment.cancellationReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    {appointment.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "confirmed")
                          }
                          disabled={
                            updateAppointment.isPending ||
                            !!(appointment.priority && appointment.priority > 1)
                          }
                          title={
                            appointment.priority && appointment.priority > 1
                              ? "Cannot confirm - appointment has scheduling conflict. Please request reschedule instead."
                              : ""
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </button>
                        {appointment.priority && appointment.priority > 1 && (
                          <div className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Has conflict - use reschedule
                          </div>
                        )}
                      </>
                    )}
                    {appointment.status === "arrived" && (
                      <button
                        onClick={() => handleCompleteAppointment(appointment)}
                        disabled={
                          updateAppointment.isPending || createVisit.isPending
                        }
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    )}
                    {appointment.status === "completed" && (
                      <button
                        onClick={() =>
                          setViewDetailsModal({
                            appointmentId: appointment.id,
                            patientName: `${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
                            date: appointment.date,
                          })
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 min-w-[120px]"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    )}
                    {(appointment.status === "pending" ||
                      appointment.status === "confirmed") && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(appointment.id, "cancelled")
                        }
                        disabled={updateAppointment.isPending}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No appointments found
              </h3>
              <p className="text-slate-500 text-sm">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "You don't have any appointments yet"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Request Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-2xl sticky top-0">
              <h2 className="text-2xl font-bold text-white">
                Request Reschedule
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Patient: {rescheduleModal.patientName}
              </p>
              <p className="text-orange-100 text-xs mt-1">
                Current:{" "}
                {new Date(rescheduleModal.currentDate).toLocaleDateString()} at{" "}
                {rescheduleModal.currentTime}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Reason Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Reschedule *
                </label>
                <select
                  value={reasonType}
                  onChange={(e) => setReasonType(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {rescheduleReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Details (shown for all, required for "other") */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {reasonType === "other"
                    ? "Please specify *"
                    : "Additional details (optional)"}
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder={
                    reasonType === "other"
                      ? "Please provide the reason for reschedule..."
                      : "Add any additional information..."
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Proposed Date and Time */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Propose New Schedule
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Date *
                    </label>
                    <input
                      type="date"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Time *
                    </label>
                    <input
                      type="time"
                      value={proposedTime}
                      onChange={(e) => setProposedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-3">
                  💡 The patient will be notified and can accept or decline this
                  new schedule.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setRescheduleModal(null);
                  setRescheduleReason("");
                  setProposedDate("");
                  setProposedTime("");
                  setReasonType("conflict");
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReschedule}
                disabled={
                  !proposedDate ||
                  !proposedTime ||
                  (reasonType === "other" && !rescheduleReason.trim()) ||
                  requestRescheduleMutation.isPending
                }
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {requestRescheduleMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Modal */}
      {diagnosisModal && (
        <DiagnosisModal
          isOpen={!!diagnosisModal}
          onClose={() => setDiagnosisModal(null)}
          onSubmit={handleDiagnosisSubmit}
          appointmentData={diagnosisModal}
          isSubmitting={createVisit.isPending || updateAppointment.isPending}
        />
      )}

      {/* Visit Details Modal */}
      {viewDetailsModal && (
        <VisitDetailsModal
          isOpen={!!viewDetailsModal}
          onClose={() => setViewDetailsModal(null)}
          visitData={{
            patientName: viewDetailsModal.patientName,
            date: viewDetailsModal.date,
            chiefComplaint: visitDetails?.visit?.chiefComplaint,
            diagnoses: visitDetails?.diagnoses,
            vitals: visitDetails?.vitals,
          }}
        />
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
