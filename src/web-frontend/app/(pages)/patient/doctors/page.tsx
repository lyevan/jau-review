"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Star,
  Calendar,
  Award,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import BookAppointmentModal from "./_components/BookAppointmentModal";
import { useGetDoctors } from "@/app/_hooks/queries/useDoctors";

type Doctor = {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  yearsExperience: number;
  medicalSchool?: string | null;
  biography?: string | null;
  licenseNumber?: string | null;
  email?: string | null;
};

const DoctorDetailsModal = ({
  doctor,
  onClose,
}: {
  doctor: Doctor;
  onClose: () => void;
}) => {
  const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const image =
    doctor.firstName.toLowerCase().includes("sarah") ||
    doctor.firstName.toLowerCase().includes("maria")
      ? "/assets/doctor-female.webp"
      : "/assets/doctor-male.webp";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Doctor Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Doctor Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-32 h-32">
              <Image
                src={image}
                alt={doctorName}
                width={128}
                height={128}
                className="rounded-full object-cover border-4 border-teal-100 shadow-lg"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {doctorName}
              </h3>
              <p className="text-teal-600 font-medium text-lg mb-3">
                {doctor.specialization}
              </p>
              {doctor.licenseNumber && (
                <p className="text-sm text-slate-500">
                  License No: {doctor.licenseNumber}
                </p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-teal-600" />
                <p className="font-semibold text-slate-700">Experience</p>
              </div>
              <p className="text-slate-600">{doctor.yearsExperience} years</p>
            </div>

            {doctor.medicalSchool && (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <p className="font-semibold text-slate-700">Medical School</p>
                </div>
                <p className="text-slate-600">{doctor.medicalSchool}</p>
              </div>
            )}

            {doctor.email && (
              <div className="bg-slate-50 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <p className="font-semibold text-slate-700">Email</p>
                </div>
                <p className="text-slate-600">{doctor.email}</p>
              </div>
            )}
          </div>

          {/* Biography */}
          {doctor.biography && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">About</h4>
              <p className="text-slate-600 leading-relaxed">
                {doctor.biography}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DoctorPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDetailsDoctor, setViewDetailsDoctor] = useState<Doctor | null>(
    null
  );

  const { data: doctors, isLoading, error } = useGetDoctors();

  const handleBook = (id: number, name: string) => {
    setSelectedDoctor({ id, name });
    setModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Error loading doctors
          </h3>
          <p className="text-slate-500 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Meet Our Doctors
          </h1>
          <p className="text-slate-600 text-lg">
            Choose from our experienced medical professionals
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {doctors &&
            doctors.map((doc) => {
              const doctorName = `Dr. ${doc.firstName} ${doc.lastName}`;
              // Determine image based on name/gender (simple approach)
              const image =
                doc.firstName.toLowerCase().includes("sarah") ||
                doc.firstName.toLowerCase().includes("maria")
                  ? "/assets/doctor-female.webp"
                  : "/assets/doctor-male.webp";

              return (
                <div
                  key={doc.id}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative bg-gradient-to-br from-teal-50 to-blue-50 p-6">
                    <div className="relative w-40 h-40 mx-auto">
                      <Image
                        src={image}
                        alt={doctorName}
                        width={160}
                        height={160}
                        className="rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 space-y-4">
                    {/* Name & Specialty */}
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-slate-800 mb-1">
                        {doctorName}
                      </h2>
                      <p className="text-teal-600 font-medium text-sm">
                        {doc.specialization}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="w-4 h-4 text-slate-400" />
                          <p className="text-xs text-slate-500">Experience</p>
                        </div>
                        <p className="font-semibold text-slate-700">
                          {doc.yearsExperience} years
                        </p>
                      </div>
                      {doc.medicalSchool && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <p className="text-xs text-slate-500">School</p>
                          </div>
                          <p className="font-semibold text-slate-700 text-xs truncate">
                            {doc.medicalSchool.split(" ")[0]}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Biography */}
                    {doc.biography && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {doc.biography}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setViewDetailsDoctor(doc)}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors duration-200 shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleBook(doc.id, doctorName)}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Book Appointment Modal */}
        {selectedDoctor && (
          <BookAppointmentModal
            doctorId={selectedDoctor.id}
            doctorName={selectedDoctor.name}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}

        {/* Doctor Details Modal */}
        {viewDetailsDoctor && (
          <DoctorDetailsModal
            doctor={viewDetailsDoctor}
            onClose={() => setViewDetailsDoctor(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorPage;
