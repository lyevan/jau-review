"use client";

import { useState, useMemo } from "react";
import StatsCards from "./_components/StatsCards";
import {
  Calendar,
  Loader2,
  AlertCircle,
  Clock,
  User,
  Phone,
  CheckCircle,
} from "lucide-react";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";

export default function DoctorDashboardPage() {
  const { data: appointments, isLoading, error } = useGetAppointments();

  // Get today's appointments
  const todayAppointments = useMemo(() => {
    if (!appointments) return [];

    const today = new Date().toISOString().split("T")[0];
    return appointments.filter((appt) => appt.date === today);
  }, [appointments]);

  // Convert to Patient format for StatsCards
  const patients = useMemo(() => {
    return todayAppointments.map((appt) => ({
      id: `P${appt.id}`,
      appointmentId: appt.id,
      name: `${appt.patient?.firstName || ""} ${appt.patient?.lastName || ""}`,
      appointmentTime: appt.startTime,
      status:
        appt.status === "confirmed"
          ? ("waiting" as const)
          : appt.status === "completed"
            ? ("done" as const)
            : appt.status === "cancelled"
              ? ("cancelled" as const)
              : ("waiting" as const),
      hasSoapNotes: appt.status === "completed",
    }));
  }, [todayAppointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
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
          <p className="text-slate-600 text-lg">Failed to load dashboard</p>
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
            Doctor Dashboard
          </h1>
          <p className="text-slate-600">
            Today&apos;s appointments and patient consultations
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards patients={patients} />

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Today&apos;s Schedule
          </h2>

          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-teal-600" />
                        <h3 className="font-semibold text-slate-800">
                          {appt.patient?.firstName} {appt.patient?.lastName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(appt.status)}`}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 ml-8">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{appt.startTime}</span>
                        </div>
                        {appt.reason && (
                          <div>
                            <span className="font-medium">Reason:</span>{" "}
                            {appt.reason}
                          </div>
                        )}
                      </div>
                    </div>
                    {appt.status === "confirmed" && (
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Call Patient
                      </button>
                    )}
                    {appt.status === "completed" && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">
                No appointments scheduled for today
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
