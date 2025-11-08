"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
} from "lucide-react";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";
import { formatDateToYYYYMMDD, formatToYYYYMMDD } from "@/app/_utils/dateUtils";

export default function DoctorCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: appointments, isLoading } = useGetAppointments();

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
    if (!appointments) return false;
    // Create date string directly to avoid timezone issues
    const dateKey = formatToYYYYMMDD(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return appointments.some(
      (appt) => appt.date === dateKey && appt.status !== "cancelled"
    );
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

  // Create date key in local timezone to avoid off-by-one errors
  const selectedDateKey = formatDateToYYYYMMDD(selectedDate);

  const dayAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter((appt) => appt.date === selectedDateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDateKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "reschedule_requested":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "reschedule_requested":
        return "Reschedule Requested";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-teal-600" />
            Appointments Calendar
          </h1>
          <p className="text-slate-600">View your appointments by date</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const hasAppts = hasAppointments(day);
                const selected = isDateSelected(day);

                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all ${selected ? "bg-teal-600 text-white shadow-lg scale-105" : hasAppts ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    {day}
                    {hasAppts && !selected && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Legend:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-600 rounded-lg"></div>
                  <span className="text-sm text-slate-700">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-50 border border-teal-200 rounded-lg"></div>
                  <span className="text-sm text-slate-700">
                    Has Appointments
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-teal-600" />
              {selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </h2>

            {isLoading ? (
              <div className="text-center py-8 text-slate-500">
                Loading appointments...
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No appointments</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {dayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-slate-800">
                          {appt.startTime}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appt.status)}`}
                      >
                        {getStatusLabel(appt.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-700 font-medium">
                        {appt.patient?.firstName} {appt.patient?.lastName}
                      </span>
                    </div>

                    {appt.reason && (
                      <div className="flex items-start gap-2 mt-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {appt.reason}
                        </p>
                      </div>
                    )}

                    {appt.priority && appt.priority > 1 && (
                      <div className="mt-2 text-xs text-orange-600 font-medium">
                        ⚠️ Conflict - Priority #{appt.priority}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
