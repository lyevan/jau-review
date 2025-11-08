"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from "lucide-react";

type Event = {
  id: number;
  date: Date;
  title: string;
  description: string;
  doctor: string;
  time: string;
  type: "checkup" | "consultation" | "follow-up";
};

const events: Event[] = [
  {
    id: 1,
    date: new Date(2025, 7, 24),
    title: "General Checkup",
    description: "Annual health checkup and routine examination",
    doctor: "Dr. Smith",
    time: "10:00 AM",
    type: "checkup",
  },
  {
    id: 2,
    date: new Date(2025, 7, 24),
    title: "Cardiology Consultation",
    description: "Follow-up for heart condition monitoring",
    doctor: "Dr. Lee",
    time: "2:00 PM",
    type: "consultation",
  },
  {
    id: 3,
    date: new Date(2025, 7, 25),
    title: "Pediatrics Appointment",
    description: "Child wellness checkup and vaccination",
    doctor: "Dr. Garcia",
    time: "9:30 AM",
    type: "follow-up",
  },
  {
    id: 4,
    date: new Date(2025, 7, 26),
    title: "Dental Cleaning",
    description: "Routine dental hygiene appointment",
    doctor: "Dr. Johnson",
    time: "11:00 AM",
    type: "checkup",
  },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 7, 24));
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const hasEvent = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return events.some(event => event.date.toDateString() === date.toDateString());
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return selectedDate.toDateString() === date.toDateString();
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
  };

  const filteredEvents = events.filter(
    (event) => event.date.toDateString() === selectedDate.toDateString()
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "checkup":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "consultation":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "follow-up":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Appointment Calendar</h1>
          <p className="text-slate-600">View and manage your scheduled appointments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {/* Calendar Header */}
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

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-slate-500 py-2">
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
                  const hasEvents = hasEvent(day);
                  const selected = isDateSelected(day);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                        ${selected 
                          ? 'bg-teal-600 text-white shadow-lg scale-105' 
                          : hasEvents
                          ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                          : 'hover:bg-slate-100 text-slate-700'
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

              {/* Legend */}
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

          {/* Appointments Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h2>
                <span className="text-sm text-slate-500">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'appointment' : 'appointments'}
                </span>
              </div>

              {filteredEvents.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                          {event.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4 text-teal-600" />
                          <span>{event.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span>{event.time}</span>
                        </div>
                      </div>

                      <button className="w-full mt-3 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">No appointments scheduled</p>
                  <p className="text-slate-400 text-xs mt-1">Select a date with events to view appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}