"use client";

import { useState, useEffect, useRef } from "react";
import type { Appointment } from "../page";

interface Props {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  onSelectAppointment: (appointment: Appointment | null) => void;
}

export default function PatientSearch({ appointments, selectedAppointment, onSelectAppointment }: Props) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Filter appointments dynamically
  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Appointment Selection</h2>

      {/* --- SEARCH MODE --- */}
      {!selectedAppointment ? (
        <div className="relative" ref={resultsRef}>
          <input
            type="text"
            placeholder="Search appointment by patient or doctor name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {showResults && (
            <div className="absolute z-20 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {appointments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No appointments scheduled for today
                </div>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => {
                      onSelectAppointment(appointment);
                      setShowResults(false);
                      setSearch("");
                    }}
                    className="p-4 hover:bg-teal-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-600">with {appointment.doctorName}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p className="font-medium text-teal-600">{appointment.time}</p>
                        <p className="text-xs">{appointment.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No matching appointments</div>
              )}
            </div>
          )}

          {/* Show all appointments as cards when not searching */}
          {!search && appointments.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 mb-2">Today's Appointments ({appointments.length})</p>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => onSelectAppointment(appointment)}
                    className="p-3 border rounded-lg hover:border-teal-500 hover:bg-teal-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{appointment.patientName}</p>
                        <p className="text-xs text-gray-600">{appointment.doctorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-teal-600">{appointment.time}</p>
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- SELECTED APPOINTMENT MODE --- */
        <div className="bg-teal-50 rounded-lg p-4 border-2 border-teal-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selectedAppointment.patientName}</h3>
              <p className="text-sm text-gray-600">Patient ID: {selectedAppointment.patientId}</p>
            </div>
            <button
              onClick={() => onSelectAppointment(null)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Doctor:</p>
              <p className="font-semibold">{selectedAppointment.doctorName}</p>
            </div>
            <div>
              <p className="text-gray-600">Time:</p>
              <p className="font-semibold">{selectedAppointment.time}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
