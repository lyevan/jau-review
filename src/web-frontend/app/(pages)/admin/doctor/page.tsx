"use client";
import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  UserPlus,
  Mail,
  Search,
  X,
  Stethoscope,
  Award,
  Calendar,
  Loader2,
  User,
  Building,
  FileText,
  Eye,
  Phone,
  Plus,
  Clock,
} from "lucide-react";
import { toast } from "@/app/_utils/toast";
import {
  useGetDoctors,
  useGetDoctorSchedule,
} from "@/app/_hooks/queries/useDoctors";
import { useSearchParams } from "next/navigation";
import AddDoctorModal from "./_components/AddDoctorModal";

export default function ModernDoctorCRUD() {
  const searchParams = useSearchParams();
  const viewDoctorId = searchParams.get("view");

  const { data: doctors = [], isLoading, refetch } = useGetDoctors();
  const [search, setSearch] = useState("");
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch schedule when viewing doctor details
  const { data: doctorSchedule = [] } = useGetDoctorSchedule(
    viewDetails?.id || 0
  );

  // Auto-open details modal if URL has view param
  useEffect(() => {
    if (viewDoctorId && doctors.length > 0) {
      const doctor = doctors.find((d: any) => d.id === parseInt(viewDoctorId));
      if (doctor) {
        setViewDetails(doctor);
      }
    }
  }, [viewDoctorId, doctors]);

  const filteredDoctors = doctors.filter(
    (d: any) =>
      `${d.firstName} ${d.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const activeDoctors = doctors.filter((d: any) => d.status === "active");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-teal-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-600 to-cyan-600 mb-2 flex items-center gap-3">
            <Stethoscope className="w-10 h-10 text-teal-600" />
            Doctors Management
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your medical professionals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Total Doctors
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {doctors.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {activeDoctors.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Inactive</p>
                <p className="text-3xl font-bold text-orange-600">
                  {doctors.length - activeDoctors.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Specialties
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(doctors.map((d: any) => d.specialization)).size}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <Award className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or email..."
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-linear-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Doctor
            </button>
          </div>

          {/* Doctor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-400 text-lg">No doctors found</p>
              </div>
            ) : (
              filteredDoctors.map((doctor: any) => (
                <div
                  key={doctor.id}
                  className="group bg-linear-to-br from-slate-50 to-white p-6 rounded-2xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-teal-100 to-cyan-100 flex items-center justify-center border-4 border-white shadow-md">
                      <User className="w-10 h-10 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          doctor.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {doctor.status}
                      </span>
                      <h3 className="text-xl font-bold text-slate-800 mt-2">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-teal-600 font-medium flex items-center gap-1">
                        <Stethoscope className="w-4 h-4" />
                        {doctor.specialization || "General Practice"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-teal-500" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    {doctor.licenseNumber && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="w-4 h-4 text-teal-500" />
                        <span>License: {doctor.licenseNumber}</span>
                      </div>
                    )}
                    {doctor.yearsExperience && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Award className="w-4 h-4 text-teal-500" />
                        <span>{doctor.yearsExperience} years experience</span>
                      </div>
                    )}
                    {doctor.medicalSchool && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building className="w-4 h-4 text-teal-500" />
                        <span className="truncate">{doctor.medicalSchool}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewDetails(doctor)}
                      className="flex-1 px-4 py-2 bg-white border-2 border-teal-600 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => toast.info("Edit feature coming soon")}
                      className="px-4 py-2 bg-white border-2 border-slate-400 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toast.info("Delete feature coming soon")}
                      className="px-4 py-2 bg-white border-2 border-red-400 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Doctor Details Modal */}
      {viewDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Doctor Details
              </h2>
              <button
                onClick={() => setViewDetails(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-teal-100 to-cyan-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Dr. {viewDetails.firstName} {viewDetails.lastName}
                  </h3>
                  <p className="text-teal-600 font-medium flex items-center gap-2 mt-1">
                    <Stethoscope className="w-5 h-5" />
                    {viewDetails.specialization || "General Practice"}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                      viewDetails.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {viewDetails.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-700">
                          {viewDetails.email}
                        </p>
                      </div>
                    </div>
                    {viewDetails.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-xs text-slate-500">Phone</p>
                          <p className="text-sm font-medium text-slate-700">
                            {viewDetails.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">
                    Professional Details
                  </h4>
                  <div className="space-y-3">
                    {viewDetails.licenseNumber && (
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-xs text-slate-500">
                            License Number
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            {viewDetails.licenseNumber}
                          </p>
                        </div>
                      </div>
                    )}
                    {viewDetails.yearsExperience && (
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-xs text-slate-500">Experience</p>
                          <p className="text-sm font-medium text-slate-700">
                            {viewDetails.yearsExperience} years
                          </p>
                        </div>
                      </div>
                    )}
                    {viewDetails.medicalSchool && (
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-xs text-slate-500">
                            Medical School
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            {viewDetails.medicalSchool}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {viewDetails.biography && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-500 mb-2">
                    Biography
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {viewDetails.biography}
                  </p>
                </div>
              )}

              {/* Doctor Schedule Section */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Weekly Schedule
                </h4>
                {doctorSchedule.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      No schedule available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].map((day) => {
                      const daySchedules = doctorSchedule.filter(
                        (s: any) => s.day === day
                      );
                      return (
                        <div
                          key={day}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="w-24 shrink-0">
                            <p className="text-sm font-semibold text-slate-700 capitalize">
                              {day}
                            </p>
                          </div>
                          <div className="flex-1">
                            {daySchedules.length === 0 ? (
                              <p className="text-sm text-slate-400">
                                Not available
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {daySchedules.map((schedule: any) => {
                                  // Format time from 24h to 12h
                                  const formatTime = (time: string) => {
                                    const [hours, mins] = time.split(":");
                                    const hour = parseInt(hours);
                                    const ampm = hour >= 12 ? "PM" : "AM";
                                    const displayHour =
                                      hour === 0
                                        ? 12
                                        : hour > 12
                                          ? hour - 12
                                          : hour;
                                    return `${displayHour}:${mins} ${ampm}`;
                                  };

                                  return (
                                    <div
                                      key={schedule.id}
                                      className="flex items-center gap-2"
                                    >
                                      <Clock className="w-3 h-3 text-teal-500" />
                                      <p className="text-sm text-slate-700">
                                        {formatTime(schedule.startTime)} -{" "}
                                        {formatTime(schedule.endTime)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => toast.info("Edit feature coming soon")}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Edit Doctor
                </button>
                <button
                  onClick={() => setViewDetails(null)}
                  className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
