"use client";
import React, { useState, useRef, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  FileText,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  useGetDoctorSchedule,
  useGetDoctorAppointments,
} from "@/app/_hooks/queries/useDoctors";
import {
  useCreateAppointment,
  useCancelAppointment,
} from "@/app/_hooks/mutations/useAppointments";
import { useGetAppointments } from "@/app/_hooks/queries/useAppointments";
import { toast } from "@/app/_utils/toast";
import { formatDateToYYYYMMDD } from "@/app/_utils/dateUtils";

interface Props {
  doctorId: number;
  doctorName: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookAppointmentModal: React.FC<Props> = ({
  doctorId,
  doctorName,
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [pmhx, setPmhx] = useState("");
  const [famhx, setFamhx] = useState("");
  const [pshx, setPshx] = useState("");
  const [reason, setReason] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Conflict handling states
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictType, setConflictType] = useState<
    "same-doctor" | "different-doctor" | null
  >(null);
  const [conflictingAppointment, setConflictingAppointment] =
    useState<any>(null);

  const pmhxRef = useRef<HTMLTextAreaElement>(null);
  const famhxRef = useRef<HTMLTextAreaElement>(null);
  const pshxRef = useRef<HTMLTextAreaElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  // Fetch appointments to check for conflicts
  const { data: appointments } = useGetAppointments();

  // Fetch doctor's schedule
  const {
    data: doctorSchedule,
    isLoading,
    error,
  } = useGetDoctorSchedule(doctorId);

  // Fetch doctor's appointments for the selected date
  const formattedDate = selectedDate ? formatDateToYYYYMMDD(selectedDate) : "";
  const { data: doctorAppointments } = useGetDoctorAppointments(
    doctorId,
    formattedDate
  );

  // Create appointment mutation
  const createAppointment = useCreateAppointment();
  const cancelAppointment = useCancelAppointment();

  // Generate available time slots based on doctor's schedule
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !doctorSchedule) return [];

    const dayName = selectedDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

    // Get all schedule blocks for the selected day
    const schedulesForDay = doctorSchedule.filter((s) => s.day === dayName);

    console.log("📅 Modal - Selected date:", selectedDate);
    console.log("📅 Modal - Day name:", dayName);
    console.log("📋 Modal - Schedules for day:", schedulesForDay);

    if (schedulesForDay.length === 0) return [];

    // Generate 30-minute time slots for all time blocks
    const timeSlots: string[] = [];
    const allSlots = Array.from({ length: 48 }, (_, i) => {
      const hours = Math.floor(i / 2);
      const minutes = i % 2 === 0 ? "00" : "30";
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    });

    // Filter to only include slots within ANY of the doctor's scheduled time blocks
    allSlots.forEach((slot) => {
      const slotTime = slot + ":00";
      const isWithinSchedule = schedulesForDay.some((schedule) => {
        // Slot must be >= startTime and < endTime (not <=)
        // This ensures last slot is 30 minutes before end time
        return slotTime >= schedule.startTime && slotTime < schedule.endTime;
      });
      if (isWithinSchedule) {
        // Convert to 12-hour format for display
        const [hours, mins] = slot.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        timeSlots.push(`${displayHour}:${mins} ${ampm}`);
      }
    });

    console.log("⏰ Modal - Available time slots:", timeSlots);
    return timeSlots;
  }, [selectedDate, doctorSchedule]);

  // Check if a time slot is already booked by the doctor
  const isTimeSlotBooked = (time12h: string) => {
    if (!doctorAppointments || !selectedDate) return false;

    // Convert 12-hour time to 24-hour format
    const [timePart, modifier] = time12h.split(" ");
    let [hours, mins] = timePart.split(":");
    if (hours === "12") {
      hours = modifier === "AM" ? "00" : "12";
    } else if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }
    const time24h = `${hours.padStart(2, "0")}:${mins}:00`;

    // Check if doctor has any appointment at this time (confirmed, pending, or arrived)
    return doctorAppointments.some(
      (appt: any) =>
        appt.startTime === time24h &&
        ["pending", "confirmed", "arrived"].includes(appt.status)
    );
  };

  // Determine available dates (days when doctor has schedule)
  const availableDays = useMemo(() => {
    if (!doctorSchedule) return [];
    return Array.from(new Set(doctorSchedule.map((s) => s.day)));
  }, [doctorSchedule]);

  // Disable dates where doctor doesn't work
  const disabledDays = (date: Date) => {
    const dayName = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    return !availableDays.includes(dayName);
  };

  if (!isOpen) return null;

  const handleNext = () => setStep(2);
  const handlePrev = () => setStep(1);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.warning("Please select date and time");
      return;
    }

    // Convert 12-hour time to 24-hour format
    const convertTo24Hour = (time12h: string): string => {
      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":");
      if (hours === "12") {
        hours = modifier === "AM" ? "00" : "12";
      } else if (modifier === "PM") {
        hours = String(parseInt(hours, 10) + 12);
      }
      return `${hours.padStart(2, "0")}:${minutes}:00`;
    };

    const startTime = convertTo24Hour(selectedTime);

    // Calculate end time (30 minutes later)
    const calculateEndTime = (start: string): string => {
      const [hours, minutes] = start.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + 30;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`;
    };

    const endTime = calculateEndTime(startTime);

    // Format date as YYYY-MM-DD (using local timezone to avoid date shifts)
    const formattedDate = formatDateToYYYYMMDD(selectedDate);

    // Check for conflicts with existing appointments
    const sameTimeAppointment = appointments?.find(
      (appt: any) =>
        appt.date === formattedDate &&
        appt.startTime === startTime &&
        appt.status !== "cancelled"
    );

    if (sameTimeAppointment) {
      toast.error(
        "Time slot unavailable",
        "You already have an appointment at this time"
      );
      return;
    }

    // Check for same-day appointments
    const sameDayAppointment = appointments?.find(
      (appt: any) => appt.date === formattedDate && appt.status !== "cancelled"
    );

    if (sameDayAppointment) {
      if (sameDayAppointment.doctor?.id === doctorId) {
        setConflictType("same-doctor");
      } else {
        setConflictType("different-doctor");
      }
      setConflictingAppointment(sameDayAppointment);
      setShowConflictModal(true);
      return;
    }

    // Build comprehensive reason with medical history
    let fullReason = reason;
    if (pmhx.trim()) fullReason += `\n\nPast Medical History: ${pmhx}`;
    if (famhx.trim()) fullReason += `\n\nFamily Medical History: ${famhx}`;
    if (pshx.trim()) fullReason += `\n\nPast Surgical History: ${pshx}`;

    try {
      await createAppointment.mutateAsync({
        doctorId,
        date: formattedDate,
        startTime,
        endTime,
        reason: fullReason,
      });

      setBookingSuccess(true);

      // Auto-close after 2 seconds and reset
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to book appointment:", error);
      toast.error(
        "Failed to book appointment",
        error?.response?.data?.error || "Please try again later."
      );
    }
  };

  const handleClose = () => {
    // Reset all states
    setStep(1);
    setSelectedDate(undefined);
    setSelectedTime("");
    setPmhx("");
    setFamhx("");
    setPshx("");
    setReason("");
    setBookingSuccess(false);
    setShowConflictModal(false);
    setConflictType(null);
    setConflictingAppointment(null);
    onClose();
  };

  const handleMoveAppointment = async () => {
    if (!conflictingAppointment || !selectedDate || !selectedTime) return;

    try {
      // Cancel the existing appointment
      await cancelAppointment.mutateAsync(conflictingAppointment.id);

      // Book the new appointment
      const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");
        if (hours === "12") {
          hours = modifier === "AM" ? "00" : "12";
        } else if (modifier === "PM") {
          hours = String(parseInt(hours, 10) + 12);
        }
        return `${hours.padStart(2, "0")}:${minutes}:00`;
      };

      const startTime = convertTo24Hour(selectedTime);

      const calculateEndTime = (start: string): string => {
        const [hours, minutes] = start.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + 30;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`;
      };

      const endTime = calculateEndTime(startTime);
      const formattedDate = formatDateToYYYYMMDD(selectedDate);

      let fullReason = reason;
      if (pmhx.trim()) fullReason += `\n\nPast Medical History: ${pmhx}`;
      if (famhx.trim()) fullReason += `\n\nFamily Medical History: ${famhx}`;
      if (pshx.trim()) fullReason += `\n\nPast Surgical History: ${pshx}`;

      await createAppointment.mutateAsync({
        doctorId,
        date: formattedDate,
        startTime,
        endTime,
        reason: fullReason,
      });

      setShowConflictModal(false);
      setBookingSuccess(true);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to move appointment:", error);
      toast.error(
        "Failed to move appointment",
        error?.response?.data?.error || "Please try again later."
      );
    }
  };

  const handleBookAdditional = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");
        if (hours === "12") {
          hours = modifier === "AM" ? "00" : "12";
        } else if (modifier === "PM") {
          hours = String(parseInt(hours, 10) + 12);
        }
        return `${hours.padStart(2, "0")}:${minutes}:00`;
      };

      const startTime = convertTo24Hour(selectedTime);

      const calculateEndTime = (start: string): string => {
        const [hours, minutes] = start.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + 30;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`;
      };

      const endTime = calculateEndTime(startTime);
      const formattedDate = formatDateToYYYYMMDD(selectedDate);

      let fullReason = reason;
      if (pmhx.trim()) fullReason += `\n\nPast Medical History: ${pmhx}`;
      if (famhx.trim()) fullReason += `\n\nFamily Medical History: ${famhx}`;
      if (pshx.trim()) fullReason += `\n\nPast Surgical History: ${pshx}`;

      await createAppointment.mutateAsync({
        doctorId,
        date: formattedDate,
        startTime,
        endTime,
        reason: fullReason,
      });

      setShowConflictModal(false);
      setBookingSuccess(true);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to book additional appointment:", error);
      toast.error(
        "Failed to book appointment",
        error?.response?.data?.error || "Please try again later."
      );
    }
  };

  const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-2xl">
        {bookingSuccess ? (
          /* Success Message */
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Appointment Booked Successfully!
            </h2>
            <p className="text-slate-600 mb-2">
              Your appointment with {doctorName} has been scheduled.
            </p>
            <p className="text-sm text-slate-500">
              You will be redirected shortly...
            </p>
          </div>
        ) : (
          <>
            {/* Header - Fixed */}
            <div className="bg-linear-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-2xl relative shrink-0">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Book Appointment</h2>
                  <p className="text-teal-100 text-sm">with {doctorName}</p>
                </div>
              </div>

              {/* Step Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full bg-white transition-all duration-300 ${
                        step >= 1 ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  <span className="text-xs text-white/90 font-medium">
                    Schedule
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full bg-white transition-all duration-300 ${
                        step >= 2 ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  <span className="text-xs text-white/90 font-medium text-right block">
                    Medical Info
                  </span>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <p className="font-semibold">Error loading doctor schedule</p>
                  <p className="text-sm mt-1">
                    {error instanceof Error
                      ? error.message
                      : "Failed to load schedule"}
                  </p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3 text-base">
                      <Calendar className="w-5 h-5 text-teal-600" />
                      Select Date
                    </label>
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <style jsx global>{`
                        .rdp {
                          --rdp-cell-size: 40px;
                          --rdp-accent-color: #0d9488;
                          --rdp-background-color: #0d9488;
                          margin: 0 auto;
                        }
                        .rdp-months {
                          justify-content: center;
                        }
                        .rdp-month {
                          width: 100%;
                        }
                        .rdp-table {
                          max-width: 100%;
                          margin: 0 auto;
                        }
                        .rdp-head_cell {
                          color: #64748b;
                          font-weight: 600;
                          font-size: 0.875rem;
                        }
                        .rdp-cell {
                          padding: 2px;
                        }
                        .rdp-button {
                          border-radius: 8px;
                          font-weight: 500;
                        }
                        .rdp-day_selected {
                          background-color: #0d9488 !important;
                          color: white !important;
                          font-weight: 600;
                        }
                        .rdp-day_disabled {
                          color: #cbd5e1;
                          cursor: not-allowed;
                        }
                        .rdp-day:not(.rdp-day_disabled):not(
                            .rdp-day_selected
                          ):hover {
                          background-color: #f1f5f9;
                        }
                      `}</style>
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={disabledDays}
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3 text-base">
                      <Clock className="w-5 h-5 text-teal-600" />
                      Select Time
                    </label>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                      </div>
                    ) : availableTimeSlots.length === 0 ? (
                      <div className="text-center py-6 text-slate-500">
                        {selectedDate
                          ? "No available time slots for this date"
                          : "Please select a date first"}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {availableTimeSlots.map((time) => {
                          const isBooked = isTimeSlotBooked(time);
                          return (
                            <button
                              key={time}
                              onClick={() => !isBooked && setSelectedTime(time)}
                              disabled={isBooked}
                              className={`p-3 rounded-lg border-2 transition-all font-medium text-sm relative touch-manipulation min-h-[48px] ${
                                selectedTime === time
                                  ? "border-teal-600 bg-teal-50 text-teal-700"
                                  : isBooked
                                    ? "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "border-slate-200 hover:border-teal-300 active:border-teal-400 text-slate-600 active:scale-95"
                              }`}
                            >
                              {time}
                              {isBooked && (
                                <span className="block text-xs text-red-500 mt-1">
                                  Booked
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3 text-base">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Reason for Visit
                    </label>
                    <textarea
                      ref={reasonRef}
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        autoResize(reasonRef);
                      }}
                      placeholder="Describe your symptoms or reason for checkup..."
                      className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px] text-sm"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedTime || !reason}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl text-base"
                  >
                    Continue to Medical History
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This information helps your doctor
                      prepare for your consultation. All fields are optional but
                      recommended.
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold mb-2 block text-base">
                      Past Medical History (PMHx)
                    </label>
                    <textarea
                      ref={pmhxRef}
                      value={pmhx}
                      onChange={(e) => {
                        setPmhx(e.target.value);
                        autoResize(pmhxRef);
                      }}
                      placeholder="Any previous illnesses, chronic conditions, or ongoing treatments..."
                      className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px] text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold mb-2 block text-base">
                      Family Medical History (FMHx)
                    </label>
                    <textarea
                      ref={famhxRef}
                      value={famhx}
                      onChange={(e) => {
                        setFamhx(e.target.value);
                        autoResize(famhxRef);
                      }}
                      placeholder="Any hereditary conditions or illnesses in your family..."
                      className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px] text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold mb-2 block text-base">
                      Past Surgical History (PSHx)
                    </label>
                    <textarea
                      ref={pshxRef}
                      value={pshx}
                      onChange={(e) => {
                        setPshx(e.target.value);
                        autoResize(pshxRef);
                      }}
                      placeholder="Any previous surgeries or procedures..."
                      className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px] text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handlePrev}
                      className="flex-1 border-2 border-slate-300 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 transition-colors text-base"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={createAppointment.isPending}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-2"
                    >
                      {createAppointment.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        "Confirm Appointment"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Conflict Modal */}
      {showConflictModal && conflictingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-linear-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">Appointment Conflict</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-700">
                {conflictType === "same-doctor"
                  ? `You already have an appointment with ${doctorName} on this day.`
                  : `You already have an appointment on this day with ${conflictingAppointment.doctor?.name || "another doctor"}.`}
              </p>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-600 mb-2">
                  Existing Appointment
                </p>
                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-800 font-medium">
                    {new Date(conflictingAppointment.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                  <span className="text-slate-500">Time:</span>
                  <span className="text-slate-800 font-medium">
                    {conflictingAppointment.startTime.slice(0, 5)}
                  </span>
                  <span className="text-slate-500">Doctor:</span>
                  <span className="text-slate-800 font-medium">
                    {conflictingAppointment.doctor?.name || "N/A"}
                  </span>
                </div>
              </div>

              <p className="text-slate-700">
                Would you like to move your existing appointment or book an
                additional one?
              </p>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowConflictModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveAppointment}
                disabled={
                  cancelAppointment.isPending || createAppointment.isPending
                }
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelAppointment.isPending || createAppointment.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Moving...
                  </span>
                ) : (
                  "Move Appointment"
                )}
              </button>
              <button
                onClick={handleBookAdditional}
                disabled={createAppointment.isPending}
                className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAppointment.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Booking...
                  </span>
                ) : (
                  "Book Additional"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointmentModal;
