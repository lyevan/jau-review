"use client";

import { useState } from "react";
import {
  Calendar,
  Check,
  XCircle,
  Clock,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  User,
  Stethoscope,
  Eye,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "@/app/_utils/toast";
import {
  useGetAppointments,
  useUpdateAppointment,
} from "@/app/_hooks/queries/useAppointments";

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status:
    | "pending"
    | "confirmed"
    | "arrived"
    | "completed"
    | "cancelled"
    | "reschedule_requested";
  reason: string | null;
  cancellationReason?: string | null;
  doctor?: {
    id: number;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export default function AdminAppointmentsPage() {
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    Appointment["status"] | "all"
  >("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch appointments from backend with 10-second polling for soft real-time updates
  const {
    data: appointmentsData,
    isLoading,
    refetch,
  } = useGetAppointments({
    refetchInterval: 10000, // Refetch every 10 seconds
  });
  const appointments: Appointment[] = appointmentsData || [];

  // Mutation for updating appointment status
  const updateAppointmentMutation = useUpdateAppointment();

  const handleMarkAsArrived = async (appointmentId: number) => {
    try {
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: { status: "arrived" },
      });
      toast.success("Appointment marked as arrived");
      refetch();
    } catch (error) {
      toast.error("Failed to update appointment status");
    }
  };

  const filtered = appointments.filter((a) => {
    const patientName = a.patient
      ? `${a.patient.firstName} ${a.patient.lastName}`
      : "";
    const doctorName = a.doctor
      ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName}`
      : "";

    const matchesSearch =
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toString().includes(search.toLowerCase());
    const matchesDate = filterDate ? a.date.startsWith(filterDate) : true;
    const matchesStatus =
      filterStatus === "all" ? true : a.status === filterStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    scheduled: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const configs: Record<
      string,
      { bg: string; icon: React.ReactElement; label: string }
    > = {
      completed: {
        bg: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle className="w-3 h-3" />,
        label: "Cancelled",
      },
      pending: {
        bg: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <Clock className="w-3 h-3" />,
        label: "Pending",
      },
      confirmed: {
        bg: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Check className="w-3 h-3" />,
        label: "Scheduled",
      },
      arrived: {
        bg: "bg-purple-100 text-purple-700 border-purple-200",
        icon: <User className="w-3 h-3" />,
        label: "Arrived",
      },
      reschedule_requested: {
        bg: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <AlertCircle className="w-3 h-3" />,
        label: "Reschedule Requested",
      },
    };

    const config = configs[status];

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ["ID", "Patient Name", "Doctor", "Date", "Time", "Status"];
    const csvRows = [
      headers.join(","),
      ...filtered.map((a) => {
        const patientName = a.patient
          ? `${a.patient.firstName} ${a.patient.lastName}`
          : "N/A";
        const doctorName = a.doctor
          ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName}`
          : "N/A";
        return `${a.id},${patientName},${doctorName},${a.date},${a.startTime},${a.status}`;
      }),
    ];
    const csvContent = csvRows.join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointments_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Appointments data refreshed!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-teal-600" />
            Appointments Management
          </h1>
          <p className="text-slate-600">
            Track and manage all clinic appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.scheduled}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and Date Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Date Filter */}
              <div className="relative w-full md:w-auto">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full md:w-auto pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters and Actions Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Status Filter */}
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as Appointment["status"] | "all"
                    )
                  }
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Scheduled</option>
                  <option value="arrived">Arrived</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="reschedule_requested">
                    Reschedule Requested
                  </option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                      Time
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-800 font-medium">
                          {appointment.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {appointment.patient
                                ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                                : "N/A"}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {appointment.patient?.id || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <span className="text-sm text-slate-700">
                            {appointment.doctor
                              ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-700">
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {appointment.startTime}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Mark as Arrived button - only for confirmed appointments */}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleMarkAsArrived(appointment.id)
                              }
                              disabled={updateAppointmentMutation.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as Arrived"
                            >
                              <User size={14} />
                              Arrived
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(appointment)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No appointments found
              </h3>
              <p className="text-slate-500 text-sm">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filtered.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Showing {filtered.length} of {appointments.length} appointments
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Appointment Details
                      </h2>
                      <p className="text-teal-100 text-sm">
                        {selectedAppointment.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex justify-center">
                  {getStatusBadge(selectedAppointment.status)}
                </div>

                {/* Patient Information */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Patient Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Full Name</p>
                      <p className="font-semibold text-slate-800">
                        {selectedAppointment.patient
                          ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Patient ID</p>
                      <p className="font-mono font-semibold text-slate-800">
                        {selectedAppointment.patient?.id || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Doctor Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Assigned Doctor
                      </p>
                      <p className="font-semibold text-slate-800">
                        {selectedAppointment.doctor
                          ? `Dr. ${selectedAppointment.doctor.firstName} ${selectedAppointment.doctor.lastName}`
                          : "N/A"}
                      </p>
                    </div>
                    {selectedAppointment.doctor?.specialization && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">
                          Specialization
                        </p>
                        <p className="font-semibold text-slate-800">
                          {selectedAppointment.doctor.specialization}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Schedule */}
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Schedule
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Date</p>
                      <p className="font-semibold text-slate-800">
                        {new Date(selectedAppointment.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Time</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <p className="font-semibold text-slate-800">
                          {selectedAppointment.startTime} -{" "}
                          {selectedAppointment.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedAppointment.reason && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-600 mb-1">Reason</p>
                      <p className="text-slate-800">
                        {selectedAppointment.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Cancellation Reason */}
                {selectedAppointment.status === "cancelled" &&
                  selectedAppointment.cancellationReason && (
                    <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                          <XCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-800 mb-2">
                            Cancellation Reason
                          </h3>
                          <p className="text-red-700">
                            {selectedAppointment.cancellationReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-6 rounded-b-2xl border-t border-slate-200">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
