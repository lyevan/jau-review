"use client";

import { useState } from "react";
import { 
  Phone, 
  Check, 
  Calendar,
  Clock,
  User,
  Filter,
  X,
  Save,
  FileText,
  Activity,
  Heart,
  Edit,
  CheckCircle,
  XCircle
} from "lucide-react";

type AppointmentStatus = "waiting" | "ongoing" | "done" | "cancelled";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  familyHistory?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  age?: number;
  gender?: string;
  hasSoapNotes?: boolean;
}

interface SoapData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export default function DoctorAppointmentsPage() {
  const [filterStatus, setFilterStatus] = useState<"all" | AppointmentStatus>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([
    { 
      id: "A001", 
      patientId: "P001", 
      patientName: "Juan Dela Cruz", 
      date: "2025-08-25", 
      time: "09:00 AM", 
      status: "waiting", 
      familyHistory: "Diabetes", 
      pastMedicalHistory: "Asthma", 
      pastSurgicalHistory: "Appendectomy",
      age: 25,
      gender: "Male",
      hasSoapNotes: false
    },
    { 
      id: "A002", 
      patientId: "P002", 
      patientName: "Maria Santos", 
      date: "2025-08-25", 
      time: "09:30 AM", 
      status: "ongoing", 
      familyHistory: "Hypertension", 
      pastMedicalHistory: "None", 
      pastSurgicalHistory: "C-section",
      age: 30,
      gender: "Female",
      hasSoapNotes: false
    },
    { 
      id: "A003", 
      patientId: "P003", 
      patientName: "Jose Ramos", 
      date: "2025-08-26", 
      time: "10:00 AM", 
      status: "done", 
      familyHistory: "None", 
      pastMedicalHistory: "Allergy", 
      pastSurgicalHistory: "None",
      age: 28,
      gender: "Male",
      hasSoapNotes: true
    },
    { 
      id: "A004", 
      patientId: "P004", 
      patientName: "Ana Reyes", 
      date: "2025-08-26", 
      time: "10:30 AM", 
      status: "cancelled",
      age: 35,
      gender: "Female",
      hasSoapNotes: false
    },
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [soapData, setSoapData] = useState<SoapData>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });

  const handleCall = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "ongoing" }
          : a.status === "ongoing"
          ? { ...a, status: "waiting" }
          : a
      )
    );
    const patient = appointments.find((a) => a.id === id);
    if (patient) {
      setSelectedPatient({ ...patient, status: "ongoing" });
    }
  };

  const handleEditSoap = (appointment: Appointment) => {
    setSelectedPatient(appointment);
    setSoapData({
      subjective: "",
      objective: "",
      assessment: "",
      plan: ""
    });
  };

  const handleSaveSoap = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!soapData.subjective || !soapData.objective || !soapData.assessment || !soapData.plan) {
      alert("Please fill in all SOAP fields before saving.");
      return;
    }

    if (selectedPatient) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedPatient.id
            ? { ...a, status: "done", hasSoapNotes: true }
            : a
        )
      );
      
      console.log("SOAP Data saved:", { appointmentId: selectedPatient.id, ...soapData });
      alert("SOAP notes saved successfully! Appointment marked as completed.");
      setSelectedPatient(null);
      setSoapData({
        subjective: "",
        objective: "",
        assessment: "",
        plan: ""
      });
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const configs = {
      waiting: {
        bg: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock className="w-3 h-3" />,
        label: "Waiting"
      },
      ongoing: {
        bg: "bg-teal-100 text-teal-700 border-teal-200",
        icon: <Phone className="w-3 h-3" />,
        label: "Ongoing"
      },
      done: {
        bg: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Completed"
      },
      cancelled: {
        bg: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle className="w-3 h-3" />,
        label: "Cancelled"
      },
    };

    const config = configs[status];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const filteredAppointments = appointments.filter((a) => {
    const statusMatch = filterStatus === "all" || a.status === filterStatus;
    const dateMatch = !filterDate || a.date === filterDate;
    return statusMatch && dateMatch;
  });

  const stats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.status === "waiting").length,
    ongoing: appointments.filter(a => a.status === "ongoing").length,
    completed: appointments.filter(a => a.status === "done").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-teal-600" />
            My Appointments
          </h1>
          <p className="text-slate-600">View and manage your scheduled appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-xs text-slate-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-xs text-slate-600 mb-1">Waiting</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-xs text-slate-600 mb-1">Ongoing</p>
            <p className="text-2xl font-bold text-teal-600">{stats.ongoing}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-xs text-slate-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-xs text-slate-600 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All" },
                { value: "waiting", label: "Waiting" },
                { value: "ongoing", label: "Ongoing" },
                { value: "done", label: "Completed" },
                { value: "cancelled", label: "Cancelled" }
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filterStatus === status.value 
                      ? "bg-teal-600 text-white shadow-md" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Date & Time</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Age</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Gender</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{appointment.patientName}</p>
                            <p className="text-sm text-slate-500">{appointment.patientId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="font-medium text-slate-800">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700">{appointment.age}</td>
                      <td className="px-6 py-4 text-center text-slate-700">{appointment.gender}</td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {appointment.status === "waiting" && (
                            <button
                              onClick={() => handleCall(appointment.id)}
                              className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                            >
                              <Phone size={14} />
                              Call
                            </button>
                          )}
                          {appointment.status === "ongoing" && (
                            <button
                              onClick={() => handleEditSoap(appointment)}
                              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Edit size={14} />
                              {appointment.hasSoapNotes ? "Edit SOAP" : "Add SOAP"}
                            </button>
                          )}
                          {appointment.status === "done" && (
                            <span className="text-sm text-slate-500 italic">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No appointments found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredAppointments.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        )}
      </div>

      {/* SOAP Editor Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-2xl">
              <button
                onClick={() => setSelectedPatient(null)}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">SOAP Notes</h2>
                  <p className="text-teal-100 text-sm">{selectedPatient.patientName} - {selectedPatient.patientId}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSoap} className="p-6 space-y-6">
              {/* Patient Details */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Age</p>
                    <p className="font-semibold text-slate-800">{selectedPatient.age} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Gender</p>
                    <p className="font-semibold text-slate-800">{selectedPatient.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Date</p>
                    <p className="font-semibold text-slate-800">{selectedPatient.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Time</p>
                    <p className="font-semibold text-slate-800">{selectedPatient.time}</p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-red-600" />
                    <h4 className="font-semibold text-slate-800 text-sm">Family History</h4>
                  </div>
                  <p className="text-sm text-slate-600">{selectedPatient.familyHistory || "No data"}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-slate-800 text-sm">Medical History</h4>
                  </div>
                  <p className="text-sm text-slate-600">{selectedPatient.pastMedicalHistory || "No data"}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold text-slate-800 text-sm">Surgical History</h4>
                  </div>
                  <p className="text-sm text-slate-600">{selectedPatient.pastSurgicalHistory || "No data"}</p>
                </div>
              </div>

              {/* SOAP Form */}
              <div className="space-y-4">
                {[
                  { key: "subjective", label: "Subjective", placeholder: "Patient's description of symptoms, complaints, and concerns..." },
                  { key: "objective", label: "Objective", placeholder: "Observable and measurable data (vitals, physical examination findings)..." },
                  { key: "assessment", label: "Assessment", placeholder: "Diagnosis, interpretation, and clinical impression..." },
                  { key: "plan", label: "Plan", placeholder: "Treatment plan, medications, follow-up instructions..." }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {field.label} <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={soapData[field.key as keyof SoapData]}
                      onChange={(e) => setSoapData({...soapData, [field.key]: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none min-h-[100px]"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}