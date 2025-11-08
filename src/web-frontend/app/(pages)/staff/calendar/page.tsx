"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  Filter,
  CheckCircle,
} from "lucide-react";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";
import { formatToYYYYMMDD, formatDateToYYYYMMDD } from "@/app/_utils/dateUtils";

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

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch appointments
  const { data: appointmentsData, isLoading } = useGetAppointments();
  const appointments: Appointment[] = appointmentsData || [];

  // Use formatDateToYYYYMMDD to avoid timezone issues
  const dateKey = formatDateToYYYYMMDD(selectedDate);

  // Get unique doctors
  const doctors = useMemo(() => {
    const uniqueDoctors = new Map();
    appointments.forEach((apt) => {
      if (apt.doctor) {
        uniqueDoctors.set(apt.doctor.id, apt.doctor);
      }
    });
    return Array.from(uniqueDoctors.values());
  }, [appointments]);

  // Filter appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    let filtered = appointments.filter((apt) => apt.date === dateKey);

    if (filterDoctor !== "all") {
      filtered = filtered.filter(
        (apt) => apt.doctor?.id === parseInt(filterDoctor)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, dateKey, filterDoctor, filterStatus]);

  // Get appointments by date for current month
  const appointmentsByDate = useMemo(() => {
    const currentYear = currentMonth.getFullYear();
    const currentMonthNum = currentMonth.getMonth();

    return appointments
      .filter((apt) => {
        // Parse date string to avoid timezone issues
        const [year, month] = apt.date.split("-").map(Number);
        return year === currentYear && month - 1 === currentMonthNum;
      })
      .reduce(
        (acc, apt) => {
          // Parse day directly from date string to avoid timezone issues
          const day = parseInt(apt.date.split("-")[2], 10);
          if (!acc[day]) acc[day] = [];
          acc[day].push(apt);
          return acc;
        },
        {} as { [key: number]: Appointment[] }
      );
  }, [appointments, currentMonth]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const hasAppointments = (day: number) => {
    return appointmentsByDate[day] && appointmentsByDate[day].length > 0;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return selectedDate.toDateString() === date.toDateString();
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(date);
  };

  const getStatusBadge = (status: string) => {
    const configs: { [key: string]: { bg: string; label: string } } = {
      pending: {
        bg: "bg-orange-100 text-orange-700 border-orange-200",
        label: "Pending",
      },
      confirmed: {
        bg: "bg-blue-100 text-blue-700 border-blue-200",
        label: "Scheduled",
      },
      completed: {
        bg: "bg-green-100 text-green-700 border-green-200",
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-100 text-red-700 border-red-200",
        label: "Cancelled",
      },
      reschedule_requested: {
        bg: "bg-yellow-100 text-yellow-700 border-yellow-200",
        label: "Reschedule Requested",
      },
    };

    const config = configs[status] || configs.pending;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
      >
        {config.label}
      </span>
    );
  };

  const stats = {
    total: selectedDateAppointments.length,
    scheduled: selectedDateAppointments.filter((a) => a.status === "confirmed")
      .length,
    completed: selectedDateAppointments.filter((a) => a.status === "completed")
      .length,
    doctors: new Set(
      selectedDateAppointments.map((a) => a.doctor?.id).filter(Boolean)
    ).size,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading calendar...</p>
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
            <CalendarIcon className="w-8 h-8 text-teal-600" />
            Appointments Calendar
          </h1>
          <p className="text-slate-600">
            View all doctors' appointments and schedules
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Today</p>
                <p className="text-3xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
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
                <Clock className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-slate-600 mb-1">Doctors</p>
                <p className="text-3xl font-bold text-teal-600">
                  {stats.doctors}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-slate-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const hasAppts = hasAppointments(day);
                const selected = isDateSelected(day);
                const count = appointmentsByDate[day]?.length || 0;

                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                      ${
                        selected
                          ? "bg-teal-600 text-white shadow-lg scale-105"
                          : hasAppts
                            ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                            : "hover:bg-slate-100 text-slate-700"
                      }
                    `}
                  >
                    {day}
                    {hasAppts && !selected && (
                      <div className="absolute bottom-1">
                        <span className="text-xs bg-teal-600 text-white rounded-full px-1.5 py-0.5">
                          {count}
                        </span>
                      </div>
                    )}
                    {hasAppts && selected && (
                      <div className="absolute bottom-1">
                        <span className="text-xs bg-white text-teal-600 rounded-full px-1.5 py-0.5">
                          {count}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-teal-600 rounded"></div>
                <span className="text-slate-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-teal-50 border border-teal-200 rounded"></div>
                <span className="text-slate-600">Has Appointments</span>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-800">Filters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Doctor
                  </label>
                  <select
                    value={filterDoctor}
                    onChange={(e) => setFilterDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Doctors</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id.toString()}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appointments List Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  Appointments
                </h2>
                {selectedDateAppointments.length > 0 && (
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">
                    {selectedDateAppointments.length}
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-600 mb-4">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {selectedDateAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">
                      No appointments for this date
                    </p>
                  </div>
                ) : (
                  selectedDateAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold text-slate-800">
                            {appointment.startTime}
                          </span>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Patient</p>
                            <p className="text-sm font-medium text-slate-800">
                              {appointment.patient
                                ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Doctor</p>
                            <p className="text-sm font-medium text-slate-800">
                              {appointment.doctor
                                ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                                : "N/A"}
                            </p>
                            {appointment.doctor?.specialization && (
                              <p className="text-xs text-slate-500">
                                {appointment.doctor.specialization}
                              </p>
                            )}
                          </div>
                        </div>

                        {appointment.reason && (
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500">Reason</p>
                            <p className="text-sm text-slate-700">
                              {appointment.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
