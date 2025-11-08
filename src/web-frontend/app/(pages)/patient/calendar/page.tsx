"use client";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Plus,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";
import {
  useGetDoctors,
  useGetDoctorSchedule,
  useGetDoctorAppointments,
} from "@/app/_hooks/queries/useDoctors";
import {
  useCreateAppointment,
  useCancelAppointment,
} from "@/app/_hooks/mutations/useAppointments";
import { toast } from "@/app/_utils/toast";
import { formatDateToYYYYMMDD, formatToYYYYMMDD } from "@/app/_utils/dateUtils";

type BookingModalProps = {
  selectedDate: Date;
  onClose: () => void;
};

function BookingModal({ selectedDate, onClose }: BookingModalProps) {
  const { data: doctors, isLoading: loadingDoctors } = useGetDoctors();
  const { data: appointments } = useGetAppointments();
  const createAppointment = useCreateAppointment();
  const cancelAppointment = useCancelAppointment();

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictType, setConflictType] = useState<
    "same-doctor" | "different-doctor" | null
  >(null);
  const [conflictingAppointment, setConflictingAppointment] =
    useState<any>(null);

  // Fetch doctor schedule when doctor is selected
  const { data: doctorSchedule } = useGetDoctorSchedule(selectedDoctorId || 0);

  // Fetch doctor's appointments for the selected date
  const formattedDate = formatDateToYYYYMMDD(selectedDate);
  const { data: doctorAppointments } = useGetDoctorAppointments(
    selectedDoctorId || 0,
    formattedDate
  );

  // Helper to convert day number to day name
  const getDayName = (dayNumber: number): string => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[dayNumber];
  };

  // Filter time slots based on doctor's schedule (supports multiple time blocks per day)
  const availableTimeSlots = useMemo(() => {
    if (!doctorSchedule || !selectedDoctorId) return [];

    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
    const dayName = getDayName(dayOfWeek);

    // Get all schedules for this day (doctor may have multiple time blocks)
    const schedulesForDay = doctorSchedule.filter(
      (schedule: any) => schedule.day === dayName
    );

    console.log("📅 Calendar - Checking schedules for", dayName);
    console.log("📋 Schedules for day:", schedulesForDay);

    if (schedulesForDay.length === 0) return [];

    // Generate all possible 30-minute time slots (00:00 to 23:30)
    const allTimeSlots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        allTimeSlots.push(timeSlot);
      }
    }

    // Filter slots that fall within ANY of the doctor's time blocks
    const filtered = allTimeSlots.filter((slot) => {
      const slotTime = slot + ":00"; // Convert "08:00" to "08:00:00"

      const isWithin = schedulesForDay.some((schedule: any) => {
        // Slot must be >= startTime and < endTime (not <=)
        // This ensures last slot is 30 minutes before end time
        const isInRange =
          slotTime >= schedule.startTime && slotTime < schedule.endTime;
        return isInRange;
      });

      return isWithin;
    });

    console.log("⏰ Available time slots:", filtered);
    return filtered;
  }, [doctorSchedule, selectedDoctorId, selectedDate]);

  // Check if a time slot is already booked
  const isTimeSlotBooked = (time: string) => {
    if (!doctorAppointments) return false;
    
    // Check if doctor has ANY appointment at this time (confirmed, pending, or arrived)
    const isDoctorBusy = doctorAppointments.some(
      (appt: any) =>
        appt.startTime === time + ":00" &&
        ["pending", "confirmed", "arrived"].includes(appt.status)
    );

    return isDoctorBusy;
  };

  const handleBookAppointment = () => {
    if (!selectedDoctorId || !selectedTime || !reason) {
      toast.warning("Please fill in all fields");
      return;
    }

    const dateStr = formatDateToYYYYMMDD(selectedDate);

    // Check if same time slot is already booked (any doctor)
    const sameTimeAppointment = appointments?.find(
      (appt: any) =>
        appt.date === dateStr &&
        appt.startTime === selectedTime &&
        appt.status !== "cancelled"
    );

    if (sameTimeAppointment) {
      toast.error(
        "Time slot unavailable",
        "You already have an appointment at this time. Please select a different time slot."
      );
      return;
    }

    // Check for same-day appointment
    const sameDayAppointment = appointments?.find(
      (appt: any) => appt.date === dateStr && appt.status !== "cancelled"
    );

    if (sameDayAppointment) {
      // Check if it's the same doctor or different
      if (sameDayAppointment.doctor?.id === selectedDoctorId) {
        setConflictType("same-doctor");
      } else {
        setConflictType("different-doctor");
      }
      setConflictingAppointment(sameDayAppointment);
      setShowConflictModal(true);
      return;
    }

    // No conflicts, proceed with booking
    bookAppointment();
  };

  const bookAppointment = () => {
    const appointmentData = {
      doctorId: selectedDoctorId!,
      date: formatDateToYYYYMMDD(selectedDate),
      startTime: selectedTime,
      endTime: "",
      reason: reason,
    };

    createAppointment.mutate(appointmentData, {
      onSuccess: () => {
        toast.success("Appointment booked successfully!");
        setShowConflictModal(false);
        onClose();
      },
      onError: (error: any) => {
        toast.error(
          "Failed to book appointment",
          error.response?.data?.error || "Please try again later."
        );
      },
    });
  };

  const handleMoveAppointment = () => {
    if (!conflictingAppointment) return;

    // Cancel old appointment and book new one
    cancelAppointment.mutate(conflictingAppointment.id, {
      onSuccess: () => {
        bookAppointment();
      },
      onError: (error: any) => {
        toast.error(
          "Failed to cancel previous appointment",
          error.response?.data?.error || "Please try again later."
        );
      },
    });
  };

  const handleBookAdditional = () => {
    bookAppointment();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Book Appointment
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Select Doctor
            </label>
            {loadingDoctors ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {doctors?.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                    className={`p-4 border rounded-xl text-left transition-all ${
                      selectedDoctorId === doctor.id
                        ? "border-teal-600 bg-teal-50"
                        : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-slate-800">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {doctor.specialization}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedDoctorId && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Time Slot
              </label>
              {availableTimeSlots.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">
                      No Available Slots
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      The selected doctor is not available on this day. Please
                      choose a different date.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTimeSlots.map((time) => {
                    const isBooked = isTimeSlotBooked(time);
                    return (
                      <button
                        key={time}
                        onClick={() => !isBooked && setSelectedTime(time)}
                        disabled={isBooked}
                        className={`p-3 border rounded-lg text-sm font-medium transition-all min-h-[48px] touch-manipulation ${
                          selectedTime === time
                            ? "border-teal-600 bg-teal-600 text-white"
                            : isBooked
                              ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "border-slate-200 hover:border-teal-300 hover:bg-slate-50 active:scale-95"
                        }`}
                      >
                        {time}
                        {isBooked && (
                          <span className="block text-xs mt-1 text-red-500">(Booked)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedTime && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Reason for Visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                rows={4}
                placeholder="Describe your symptoms or reason for the appointment..."
              />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium touch-manipulation min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={handleBookAppointment}
            disabled={
              !selectedDoctorId ||
              !selectedTime ||
              !reason ||
              createAppointment.isPending
            }
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation min-h-[48px]"
          >
            {createAppointment.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Booking...
              </>
            ) : (
              "Book Appointment"
            )}
          </button>
        </div>
      </div>

      {/* Conflict Resolution Modal */}
      {showConflictModal && conflictingAppointment && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Appointment Conflict
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  You already have an appointment on{" "}
                  {new Date(conflictingAppointment.date).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                  {conflictingAppointment.doctor && (
                    <>
                      {" "}
                      with Dr. {conflictingAppointment.doctor.firstName}{" "}
                      {conflictingAppointment.doctor.lastName}
                    </>
                  )}{" "}
                  at {conflictingAppointment.startTime}.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {conflictType === "same-doctor" ? (
                <>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    Would you like to move your appointment to the new time (
                    {selectedTime})?
                  </p>
                  <button
                    onClick={handleMoveAppointment}
                    disabled={
                      cancelAppointment.isPending || createAppointment.isPending
                    }
                    className="w-full px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors font-medium disabled:opacity-50 touch-manipulation min-h-[48px]"
                  >
                    {cancelAppointment.isPending ||
                    createAppointment.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Moving Appointment...
                      </span>
                    ) : (
                      `Move to ${selectedTime}`
                    )}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    Would you like to book an additional appointment with a
                    different doctor?
                  </p>
                  <button
                    onClick={handleBookAdditional}
                    disabled={createAppointment.isPending}
                    className="w-full px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors font-medium disabled:opacity-50 touch-manipulation min-h-[48px]"
                  >
                    {createAppointment.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Booking...
                      </span>
                    ) : (
                      "Book Additional Appointment"
                    )}
                  </button>
                </>
              )}

              <button
                onClick={() => setShowConflictModal(false)}
                className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors font-medium touch-manipulation min-h-[48px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);

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

  const hasAppointment = (day: number) => {
    const dateStr = formatToYYYYMMDD(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return appointments?.some(
      (appt) => appt.date === dateStr && appt.status !== "cancelled"
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

  const filteredAppointments =
    appointments?.filter((appt) => {
      const selectedDateStr = formatDateToYYYYMMDD(selectedDate);
      return appt.date === selectedDateStr && appt.status !== "cancelled";
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isPastDate = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Appointment Calendar
          </h1>
          <p className="text-slate-600">
            View and manage your scheduled appointments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  {monthName}
                </h2>
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
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-slate-500 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDay }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square"></div>
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const hasEvents = hasAppointment(day);
                    const selected = isDateSelected(day);
                    const isPast = isPastDate(day);

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        disabled={isPast}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                          ${
                            selected
                              ? "bg-teal-600 text-white shadow-lg scale-105"
                              : hasEvents
                                ? "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                                : isPast
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "hover:bg-slate-100 text-slate-700"
                          }
                        `}
                      >
                        {day}
                        {hasEvents && !selected && (
                          <div className="absolute bottom-1 w-1.5 h-1.5 bg-teal-600 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-600 rounded"></div>
                  <span className="text-slate-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-50 border border-teal-200 rounded relative">
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full"></div>
                  </div>
                  <span className="text-slate-600">Has Appointments</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </h2>
                <span className="text-sm text-slate-500">
                  {filteredAppointments.length}{" "}
                  {filteredAppointments.length === 1
                    ? "appointment"
                    : "appointments"}
                </span>
              </div>

              {filteredAppointments.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto mb-4">
                  {filteredAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-800">
                          {appt.reason}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border capitalize ${getStatusColor(appt.status)}`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4 text-teal-600" />
                          <span>
                            Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span>{appt.startTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    No appointments scheduled
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Book an appointment for this date
                  </p>
                </div>
              )}

              {!isPastDate(selectedDate.getDate()) && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          selectedDate={selectedDate}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
}
