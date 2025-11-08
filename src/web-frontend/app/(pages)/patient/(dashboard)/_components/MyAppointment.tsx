"use client";
import React from "react";
import {
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";
import Link from "next/link";

const MyAppointment = () => {
  const { data: appointments, isLoading, error } = useGetAppointments();

  // Get the next upcoming appointment (pending, confirmed, arrived, or reschedule_requested)
  const nextAppointment = appointments?.find(
    (appt) =>
      appt.status === "pending" ||
      appt.status === "confirmed" ||
      appt.status === "arrived" ||
      appt.status === "reschedule_requested"
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !appointments) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>
    );
  }

  if (!nextAppointment) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            My Next Appointment
          </h2>
        </div>
        <div className="p-6 text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No upcoming appointments
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Schedule an appointment with a doctor
          </p>
          <Link
            href="/doctors"
            className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    );
  }

  const doctorName = `Dr. ${nextAppointment.doctor?.firstName || ""} ${nextAppointment.doctor?.lastName || ""}`;
  const appointmentDate = new Date(nextAppointment.date);

  // Determine status color and label
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          color: "bg-green-500",
          label: "Confirmed",
          textColor: "text-green-700",
        };
      case "pending":
        return {
          color: "bg-blue-500",
          label: "Pending",
          textColor: "text-blue-700",
        };
      case "arrived":
        return {
          color: "bg-purple-500",
          label: "Arrived",
          textColor: "text-purple-700",
        };
      case "reschedule_requested":
        return {
          color: "bg-orange-500",
          label: "Reschedule Requested",
          textColor: "text-orange-700",
        };
      default:
        return {
          color: "bg-slate-500",
          label: status,
          textColor: "text-slate-700",
        };
    }
  };

  const statusConfig = getStatusConfig(nextAppointment.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          My Next Appointment
        </h2>
      </div>

      {/* Reschedule Alert - Only shown when status is reschedule_requested */}
      {nextAppointment.status === "reschedule_requested" && (
        <div className="bg-orange-50 border-b-2 border-orange-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                Reschedule Request from Doctor
              </h3>
              <p className="text-sm text-orange-800 mb-2">
                Your doctor has requested to reschedule this appointment.
                {nextAppointment.proposedDate &&
                  nextAppointment.proposedStartTime && (
                    <span className="block mt-1 font-medium">
                      New proposed time:{" "}
                      {new Date(
                        nextAppointment.proposedDate
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at {nextAppointment.proposedStartTime}
                    </span>
                  )}
              </p>
              {nextAppointment.rescheduleReason && (
                <p className="text-sm text-orange-700 italic mb-3">
                  Reason: {nextAppointment.rescheduleReason}
                </p>
              )}
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Review & Respond
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50">
            <Image
              src="/assets/appointment.jpg"
              alt={doctorName}
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute top-3 right-3 ${statusConfig.color} text-white px-3 py-1 rounded-full text-sm font-medium`}
            >
              {statusConfig.label}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">
                {doctorName}
              </h3>
              <p className="text-sm text-slate-500">
                {nextAppointment.doctor?.specialization || "General Medicine"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium">
                    {appointmentDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="font-medium">{nextAppointment.startTime}</p>
                </div>
              </div>

              {nextAppointment.reason && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Reason:</span>{" "}
                    {nextAppointment.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/appointment"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                View All Appointments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointment;
