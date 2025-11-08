"use client";
import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";

const SmallCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: appointments } = useGetAppointments();

  // Get dates that have appointments in current month
  const appointmentDates = useMemo(() => {
    if (!appointments) return [];

    const currentYear = currentMonth.getFullYear();
    const currentMonthNum = currentMonth.getMonth();

    return appointments
      .filter((appt) => {
        const apptDate = new Date(appt.date);
        return (
          apptDate.getFullYear() === currentYear &&
          apptDate.getMonth() === currentMonthNum &&
          appt.status !== "cancelled"
        );
      })
      .map((appt) => new Date(appt.date).getDate());
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">My Calendar</h2>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center font-semibold text-slate-700">{monthName}</p>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-semibold text-slate-500 py-2"
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
          const hasAppointment = appointmentDates.includes(day);
          const isSelected = selectedDate === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                ${
                  hasAppointment
                    ? "bg-teal-500 text-white hover:bg-teal-600 shadow-sm"
                    : isSelected
                      ? "bg-slate-200 text-slate-800"
                      : "hover:bg-slate-100 text-slate-700"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded"></div>
            <span className="text-slate-600">Appointment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmallCalendar;
