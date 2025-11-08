"use client";

import { Users, Mail, Phone, Activity, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetDoctors,
  useGetDoctorSchedule,
  useGetDoctorAppointments,
} from "@/app/_hooks/queries/useDoctors";
import { useMemo } from "react";

// Component to check doctor availability
const DoctorAvailability = ({ doctorId }: { doctorId: number }) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayName = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][dayOfWeek];

  // Format today's date as YYYY-MM-DD
  const todayStr = today.toISOString().split("T")[0];

  const { data: doctorSchedule } = useGetDoctorSchedule(doctorId);
  const { data: doctorAppointments } = useGetDoctorAppointments(
    doctorId,
    todayStr
  );

  const isAvailable = useMemo(() => {
    if (!doctorSchedule) return false;

    // Check if doctor has schedule for today
    const schedulesForToday = doctorSchedule.filter(
      (schedule: any) => schedule.day === dayName
    );

    if (schedulesForToday.length === 0) return false;

    // Generate all possible 30-minute time slots for today's schedules
    const availableSlots: string[] = [];

    schedulesForToday.forEach((schedule: any) => {
      const [startHour, startMinute] = schedule.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

      for (
        let hour = startHour;
        hour < endHour || (hour === endHour && startMinute < endMinute);
        hour++
      ) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === startHour && minute < startMinute) continue;
          if (hour === endHour && minute >= endMinute) break;

          const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;

          // Check if this slot is not booked
          const isBooked = doctorAppointments?.some(
            (appt: any) =>
              appt.startTime === timeSlot &&
              ["pending", "confirmed", "arrived"].includes(appt.status)
          );

          if (!isBooked) {
            availableSlots.push(timeSlot);
          }
        }
      }
    });

    // Doctor is available if there's at least one unbooked slot
    return availableSlots.length > 0;
  }, [doctorSchedule, doctorAppointments, dayName]);

  if (isAvailable) {
    return (
      <p className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
        ● Available Today
      </p>
    );
  }

  return (
    <p className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
      ● Not Available
    </p>
  );
};

export default function DoctorList() {
  const { data: doctors, isLoading } = useGetDoctors();
  const router = useRouter();

  const handleViewDoctor = (doctorId: number) => {
    router.push(`/admin/doctor?view=${doctorId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-teal-600" />
            <h2 className="text-2xl font-bold text-slate-800">
              Available Doctors
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-5 animate-pulse">
              <div className="h-16 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeDoctors =
    doctors?.filter((d: any) => d.status === "active") || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-slate-800">
            Available Doctors
          </h2>
        </div>
        <span className="text-sm text-slate-500">
          {activeDoctors.length} active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeDoctors.slice(0, 6).map((doc: any) => (
          <div
            key={doc.id}
            className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border-2 border-slate-200 hover:border-teal-400 transition-all duration-200 hover:shadow-lg group"
          >
            <div className="w-fit ml-auto">
              <DoctorAvailability doctorId={doc.id} />
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <img
                  src={doc.profilePicture || "/assets/doctor-male.webp"}
                  alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                  <Activity className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">
                  Dr. {doc.firstName} {doc.lastName}
                </h3>
                <p className="text-sm text-slate-600">
                  {doc.specialization || "General Practice"}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-teal-600" />
                <span className="truncate">{doc.email}</span>
              </div>
              {doc.phoneNumber && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>{doc.phoneNumber}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewDoctor(doc.id)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeDoctors.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg">No active doctors found</p>
        </div>
      )}
    </div>
  );
}
