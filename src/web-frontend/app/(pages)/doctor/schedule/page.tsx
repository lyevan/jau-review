"use client";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  Edit2,
  Copy,
} from "lucide-react";
import {
  useGetDoctorSchedule,
  useGetDoctorProfile,
} from "@/app/_hooks/queries/useDoctors";
import {
  useSaveSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "@/app/_hooks/mutations/useDoctors";
import { toast } from "@/app/_utils/toast";

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type ScheduleEntry = {
  id?: number;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isEditing?: boolean;
};

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function SchedulePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  // Get doctor profile to get the doctor ID from user ID
  const { data: doctorProfile, isLoading: isLoadingProfile } =
    useGetDoctorProfile(userId);
  const doctorId = doctorProfile?.result?.id || 0;

  const { data: scheduleData, isLoading: isLoadingSchedule } =
    useGetDoctorSchedule(doctorId);
  const saveSchedule = useSaveSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");

  useEffect(() => {
    if (scheduleData) {
      setSchedules(scheduleData.map((s) => ({ ...s, isEditing: false })));
    }
  }, [scheduleData]);

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, ScheduleEntry[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    schedules.forEach((schedule) => {
      grouped[schedule.day].push(schedule);
    });

    // Sort each day's schedules by start time
    Object.keys(grouped).forEach((day) => {
      grouped[day as DayOfWeek].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
    });

    return grouped;
  }, [schedules]);

  const addTimeBlock = (day: DayOfWeek) => {
    const newBlock: ScheduleEntry = {
      day,
      startTime: "09:00",
      endTime: "17:00",
      isEditing: true,
    };
    setSchedules([...schedules, newBlock]);
  };

  const updateTimeBlock = (
    index: number,
    field: keyof ScheduleEntry,
    value: string
  ) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value, isEditing: true };
    setSchedules(updated);
  };

  const handleSave = async (index: number) => {
    const schedule = schedules[index];

    // Validate times
    if (schedule.startTime >= schedule.endTime) {
      toast.warning("Start time must be before end time");
      return;
    }

    try {
      if (schedule.id) {
        // Update existing schedule
        await updateSchedule.mutateAsync({
          doctorId,
          scheduleId: schedule.id,
          schedule: {
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          },
        });
      } else {
        // Create new schedule
        await saveSchedule.mutateAsync({
          doctorId,
          schedule: {
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          },
        });
      }

      const updated = [...schedules];
      updated[index].isEditing = false;
      setSchedules(updated);
    } catch (error: any) {
      toast.error(
        "Failed to save schedule",
        error.message || "Check for overlapping time blocks."
      );
    }
  };

  const handleDelete = async (index: number) => {
    const schedule = schedules[index];

    if (!schedule.id) {
      // If it's a new entry that hasn't been saved, just remove it from state
      setSchedules(schedules.filter((_, i) => i !== index));
      return;
    }

    if (!confirm("Are you sure you want to delete this time block?")) {
      return;
    }

    try {
      await deleteSchedule.mutateAsync({
        doctorId,
        scheduleId: schedule.id,
      });
      setSchedules(schedules.filter((_, i) => i !== index));
    } catch (error: any) {
      toast.error(
        "Failed to delete schedule",
        error.message || "Please try again later."
      );
    }
  };

  const copyToDay = (sourceDay: DayOfWeek, targetDay: DayOfWeek) => {
    const sourceSchedules = schedulesByDay[sourceDay];
    if (sourceSchedules.length === 0) {
      toast.info("No schedules to copy from this day");
      return;
    }

    const newSchedules = sourceSchedules.map((s) => ({
      day: targetDay,
      startTime: s.startTime,
      endTime: s.endTime,
      isEditing: true,
    }));

    setSchedules([...schedules, ...newSchedules]);
    setSelectedDay(targetDay);
  };

  if (isLoadingProfile || isLoadingSchedule) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">
            {isLoadingProfile ? "Loading profile..." : "Loading schedule..."}
          </p>
        </div>
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">
            Unable to load doctor profile. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const currentDaySchedules = schedules
    .map((s, index) => ({ ...s, originalIndex: index }))
    .filter((s) => s.day === selectedDay);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-teal-600" />
            Flexible Schedule Management
          </h1>
          <p className="text-slate-600">
            Create multiple time blocks per day to accommodate breaks and
            flexible working hours
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Day Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-6">
              <h3 className="font-semibold text-slate-800 mb-4">Select Day</h3>
              <div className="space-y-2">
                {DAYS.map(({ value, label }) => {
                  const count = schedulesByDay[value].length;
                  const blocks = schedulesByDay[value];
                  const totalHours = blocks.reduce((sum, block) => {
                    const start = new Date(`2000-01-01 ${block.startTime}`);
                    const end = new Date(`2000-01-01 ${block.endTime}`);
                    return (
                      sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                    );
                  }, 0);

                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedDay(value)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedDay === value
                          ? "bg-teal-600 text-white shadow-md"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{label}</span>
                        {count > 0 && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              selectedDay === value
                                ? "bg-white/20 text-white"
                                : "bg-teal-100 text-teal-700"
                            }`}
                          >
                            {count} block{count > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {count > 0 && (
                        <div
                          className={`text-xs mt-1 ${selectedDay === value ? "text-white/80" : "text-slate-500"}`}
                        >
                          {totalHours.toFixed(1)}h total
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="text-xs text-slate-600 mb-3">
                  <strong>Quick Copy:</strong> Replicate schedules to other days
                </div>
                <button
                  onClick={() => {
                    const otherDays = DAYS.filter(
                      (d) => d.value !== selectedDay
                    );
                    const dayWithSchedules = otherDays.find(
                      (d) => schedulesByDay[d.value].length > 0
                    );
                    if (dayWithSchedules) {
                      const sourceDayLabel = DAYS.find(
                        (d) => d.value === dayWithSchedules.value
                      )?.label;
                      const targetDay = prompt(
                        `Copy all time blocks from ${sourceDayLabel} to which day?\nEnter: monday, tuesday, wednesday, thursday, friday, saturday, or sunday`
                      );
                      if (
                        targetDay &&
                        DAYS.find((d) => d.value === targetDay.toLowerCase())
                      ) {
                        copyToDay(
                          dayWithSchedules.value,
                          targetDay.toLowerCase() as DayOfWeek
                        );
                      }
                    } else {
                      toast.info(
                        "Create a schedule first, then you can copy it to other days"
                      );
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy from Day
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Blocks */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800 capitalize">
                  {selectedDay} Schedule
                </h2>
                <button
                  onClick={() => addTimeBlock(selectedDay)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Time Block
                </button>
              </div>

              {currentDaySchedules.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">
                    No schedule for {selectedDay} yet
                  </p>
                  <p className="text-sm text-slate-400 mb-6">
                    Add flexible time blocks to set your availability
                  </p>
                  <button
                    onClick={() => addTimeBlock(selectedDay)}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                  >
                    Create First Time Block
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentDaySchedules.map((schedule, displayIndex) => {
                    const index = schedule.originalIndex;
                    return (
                      <div
                        key={index}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          schedule.isEditing
                            ? "border-teal-400 bg-teal-50/50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={schedule.startTime}
                                onChange={(e) =>
                                  updateTimeBlock(
                                    index,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={schedule.endTime}
                                onChange={(e) =>
                                  updateTimeBlock(
                                    index,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {schedule.isEditing ? (
                              <button
                                onClick={() => handleSave(index)}
                                disabled={
                                  saveSchedule.isPending ||
                                  updateSchedule.isPending
                                }
                                className="p-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                {saveSchedule.isPending ||
                                updateSchedule.isPending ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Save className="w-5 h-5" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const updated = [...schedules];
                                  updated[index].isEditing = true;
                                  setSchedules(updated);
                                }}
                                className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(index)}
                              disabled={deleteSchedule.isPending}
                              className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleteSchedule.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {schedule.id && !schedule.isEditing && (
                          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>
                                Saved - {schedule.startTime} to{" "}
                                {schedule.endTime}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 space-y-1">
                    <p className="font-semibold text-blue-900">
                      Flexible Scheduling Examples:
                    </p>
                    <p>
                      • <strong>Full Day with Lunch:</strong> 8:00-12:00,
                      13:00-17:00
                    </p>
                    <p>
                      • <strong>Split Shifts:</strong> 8:00-11:00, 17:00-19:00
                    </p>
                    <p>
                      • <strong>Multiple Sessions:</strong> 9:00-10:00,
                      13:00-14:00, 17:00-19:00
                    </p>
                    <p>
                      • <strong>Evening Only:</strong> 21:00-23:00
                    </p>
                    <p className="mt-2 text-blue-700">
                      Patients can only book during your active time blocks!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
