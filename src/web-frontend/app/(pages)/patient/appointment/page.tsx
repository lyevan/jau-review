"use client";
import { useState, useMemo } from "react";
import {
  Eye,
  XCircle,
  Calendar,
  Clock,
  User,
  Filter,
  Search,
  Loader2,
  X,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useGetAppointments,
  useCancelAppointment,
  useConfirmReschedule,
  useCancelWithReason,
} from "@/app/_hooks/queries/useAppointments";
import { Appointment } from "@/app/_services/appointment.service";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "arrived"
  | "completed"
  | "cancelled"
  | "reschedule_requested";

// Map backend status to display format
const statusMap: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Scheduled",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
  reschedule_requested: "Reschedule Requested",
};

export default function AppointmentsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(
    null
  );

  // Fetch appointments from backend
  const { data: appointments, isLoading, error } = useGetAppointments();
  const cancelMutation = useCancelAppointment();
  const confirmRescheduleMutation = useConfirmReschedule();
  const cancelWithReasonMutation = useCancelWithReason();

  const handleCancelClick = (id: number) => {
    setAppointmentToCancel(id);
    setShowCancelModal(true);
  };

  const handleCancelSubmit = () => {
    if (appointmentToCancel) {
      cancelWithReasonMutation.mutate(
        { id: appointmentToCancel, reason: cancelReason },
        {
          onSuccess: () => {
            setShowCancelModal(false);
            setCancelReason("");
            setAppointmentToCancel(null);
            setSelectedAppointment(null);
          },
        }
      );
    }
  };

  const handleConfirmReschedule = (id: number) => {
    if (confirm("Confirm reschedule to the new date and time?")) {
      confirmRescheduleMutation.mutate(id, {
        onSuccess: () => {
          setSelectedAppointment(null);
        },
      });
    }
  };

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter((appt: Appointment) => {
      const displayStatus =
        statusMap[appt.status as AppointmentStatus] || "Scheduled";
      const matchesStatus =
        filterStatus === "All" || displayStatus === filterStatus;
      const doctorName = `Dr. ${appt.doctor?.firstName || ""} ${appt.doctor?.lastName || ""}`;
      const matchesSearch =
        doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appt.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appt.doctor?.specialization || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, filterStatus, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Scheduled":
        return "bg-green-100 text-green-700 border-green-200";
      case "Arrived":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "Reschedule Requested":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const stats = useMemo(() => {
    if (!appointments) {
      return {
        total: 0,
        pending: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        rescheduleRequested: 0,
      };
    }

    const pending = appointments.filter(
      (a: Appointment) => a.status === "pending"
    ).length;
    const scheduled = appointments.filter(
      (a: Appointment) => a.status === "confirmed"
    ).length;
    const completed = appointments.filter(
      (a: Appointment) => a.status === "completed"
    ).length;
    const cancelled = appointments.filter(
      (a: Appointment) => a.status === "cancelled"
    ).length;
    const rescheduleRequested = appointments.filter(
      (a: Appointment) => a.status === "reschedule_requested"
    ).length;

    return {
      total: appointments.length,
      pending,
      scheduled,
      completed,
      cancelled,
      rescheduleRequested,
    };
  }, [appointments]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Error loading appointments
          </h3>
          <p className="text-slate-500 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            My Appointments
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            View and manage all your appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                  Pending
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                  Scheduled
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.scheduled}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                  Needs Action
                </p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {stats.rescheduleRequested}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                  Completed
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats.completed}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">
                  Cancelled
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm sm:text-base"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Reschedule Requested">Needs Action</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
                No appointments found
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-slate-200">
                {filteredAppointments.map((appt: Appointment) => {
                  const appointmentDate = new Date(appt.date);
                  const displayStatus =
                    statusMap[appt.status as AppointmentStatus] || "Scheduled";
                  const doctorName = `Dr. ${appt.doctor?.firstName || ""} ${appt.doctor?.lastName || ""}`;

                  return (
                    <div
                      key={appt.id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      {/* Date & Time */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {appointmentDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {appt.startTime || "N/A"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(displayStatus)}`}
                        >
                          {displayStatus}
                        </span>
                      </div>

                      {/* Doctor & Reason */}
                      <div className="ml-13 space-y-2 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Doctor</p>
                          <p className="font-medium text-slate-800 text-sm">
                            {doctorName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {appt.doctor?.specialization || "General"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Reason</p>
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {appt.reason || "Consultation"}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-13">
                        <button
                          onClick={() => setSelectedAppointment(appt)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors text-sm font-medium touch-manipulation"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {(appt.status === "pending" ||
                          appt.status === "confirmed") && (
                          <button
                            onClick={() => handleCancelClick(appt.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium touch-manipulation"
                            disabled={cancelWithReasonMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Doctor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAppointments.map((appt: Appointment) => {
                      const appointmentDate = new Date(appt.date);
                      const displayStatus =
                        statusMap[appt.status as AppointmentStatus] ||
                        "Scheduled";
                      const doctorName = `Dr. ${appt.doctor?.firstName || ""} ${appt.doctor?.lastName || ""}`;

                      return (
                        <tr
                          key={appt.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  {appointmentDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {appt.startTime || "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-800">
                                {doctorName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {appt.doctor?.specialization || "General"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-800">
                              {appt.reason || "Consultation"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(displayStatus)}`}
                            >
                              {displayStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setSelectedAppointment(appt)}
                                className="p-2 hover:bg-teal-50 rounded-lg transition-colors group"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5 text-slate-600 group-hover:text-teal-600" />
                              </button>
                              {(appt.status === "pending" ||
                                appt.status === "confirmed") && (
                                <button
                                  onClick={() => handleCancelClick(appt.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                  title="Cancel Appointment"
                                  disabled={cancelWithReasonMutation.isPending}
                                >
                                  <XCircle className="w-5 h-5 text-slate-600 group-hover:text-red-600" />
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
            </>
          )}
        </div>

        {/* Results Count */}
        {filteredAppointments.length > 0 && appointments && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Showing {filteredAppointments.length} of {appointments.length}{" "}
            appointments
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Appointment Details
              </h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    statusMap[
                      selectedAppointment.status as AppointmentStatus
                    ] || "Scheduled"
                  )}`}
                >
                  {statusMap[selectedAppointment.status as AppointmentStatus] ||
                    "Scheduled"}
                </span>
                <p className="text-sm text-slate-500">
                  Booked on{" "}
                  {new Date(selectedAppointment.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
              </div>

              {/* Doctor Information */}
              {selectedAppointment.doctor && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-8 h-8 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-lg">
                        Dr. {selectedAppointment.doctor.firstName}{" "}
                        {selectedAppointment.doctor.lastName}
                      </h3>
                      <p className="text-teal-700 text-sm">
                        {selectedAppointment.doctor.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <h4 className="font-semibold text-slate-700">Date</h4>
                  </div>
                  <p className="text-slate-800 ml-8">
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

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <h4 className="font-semibold text-slate-700">Time</h4>
                  </div>
                  <p className="text-slate-800 ml-8">
                    {selectedAppointment.startTime}
                  </p>
                </div>
              </div>

              {/* Reschedule Request Alert */}
              {selectedAppointment.status === "reschedule_requested" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800">
                      Reschedule Request
                    </h4>
                  </div>
                  <p className="text-orange-900 mb-3">
                    Your doctor has requested to reschedule this appointment.
                  </p>

                  {/* Proposed New Time */}
                  {selectedAppointment.proposedDate &&
                    selectedAppointment.proposedStartTime && (
                      <div className="bg-white rounded-lg p-4 mb-3">
                        <p className="text-sm text-slate-600 font-medium mb-2">
                          Proposed New Schedule:
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            <span className="text-slate-800 font-medium">
                              {new Date(
                                selectedAppointment.proposedDate
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-600" />
                            <span className="text-slate-800 font-medium">
                              {selectedAppointment.proposedStartTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Reason */}
                  {selectedAppointment.rescheduleReason && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Reason:
                      </p>
                      <p className="text-slate-800 leading-relaxed">
                        {selectedAppointment.rescheduleReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reason for Visit */}
              {selectedAppointment.reason && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <h4 className="font-semibold text-slate-700">
                      Reason for Visit
                    </h4>
                  </div>
                  <p className="text-slate-800 ml-8 leading-relaxed">
                    {selectedAppointment.reason}
                  </p>
                </div>
              )}

              {/* Appointment ID */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Appointment ID:{" "}
                  <span className="font-mono text-slate-700">
                    #{selectedAppointment.id}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
              {/* Reschedule Request Actions */}
              {selectedAppointment.status === "reschedule_requested" && (
                <>
                  <button
                    onClick={() =>
                      handleConfirmReschedule(selectedAppointment.id)
                    }
                    disabled={confirmRescheduleMutation.isPending}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {confirmRescheduleMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Accept New Time
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleCancelClick(selectedAppointment.id);
                    }}
                    className="flex-1 px-6 py-3 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors font-medium"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}

              {/* Regular Cancel for Pending/Confirmed */}
              {(selectedAppointment.status === "pending" ||
                selectedAppointment.status === "confirmed") && (
                <button
                  onClick={() => handleCancelClick(selectedAppointment.id)}
                  disabled={cancelWithReasonMutation.isPending}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelWithReasonMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Cancel Appointment
                    </>
                  )}
                </button>
              )}

              {/* Close Button for Completed/Cancelled or general close */}
              {(selectedAppointment.status === "pending" ||
                selectedAppointment.status === "confirmed" ||
                selectedAppointment.status === "reschedule_requested") && (
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Close
                </button>
              )}

              {/* Close only button for completed/cancelled */}
              {(selectedAppointment.status === "completed" ||
                selectedAppointment.status === "cancelled") && (
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  Cancel Appointment
                </h3>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setAppointmentToCancel(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Please provide a reason for cancelling this appointment. This
                helps the doctor understand your situation.
              </p>

              <label className="block mb-2 text-sm font-medium text-slate-700">
                Cancellation Reason
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Schedule conflict, feeling better, found another doctor..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setAppointmentToCancel(null);
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={
                  !cancelReason.trim() || cancelWithReasonMutation.isPending
                }
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelWithReasonMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Confirm Cancel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
