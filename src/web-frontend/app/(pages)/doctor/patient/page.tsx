"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Search, UserCheck, UserX, Eye } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: "active" | "inactive";
  image?: string;
}

export default function DoctorPatientListPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const patients: Patient[] = [
    { id: "P001", name: "Juan Dela Cruz", age: 25, gender: "Male", status: "active", image: "/assets/patient.jpg" },
    { id: "P002", name: "Maria Santos", age: 30, gender: "Female", status: "active", image: "/assets/patient.jpg" },
    { id: "P003", name: "Jose Ramos", age: 28, gender: "Male", status: "inactive", image: "/assets/patient.jpg" },
    { id: "P004", name: "Ana Reyes", age: 27, gender: "Female", status: "active", image: "/assets/patient.jpg" },
  ];

  const filtered = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === "active").length,
    inactive: patients.filter(p => p.status === "inactive").length,
  };

  const getStatusBadge = (status: Patient["status"]) => {
    const config = status === "active" 
      ? { bg: "bg-green-100 text-green-700 border-green-200", icon: <UserCheck className="w-3 h-3" /> }
      : { bg: "bg-gray-100 text-gray-700 border-gray-200", icon: <UserX className="w-3 h-3" /> };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <User className="w-8 h-8 text-teal-600" />
            My Patients
          </h1>
          <p className="text-slate-600">View and manage your patient records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Inactive</p>
                <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              {["all", "active", "inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${
                    filterStatus === status 
                      ? "bg-teal-600 text-white" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Patient</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">ID</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Age</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Gender</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                            {patient.image ? (
                              <img src={patient.image} alt={patient.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-teal-600" />
                            )}
                          </div>
                          <span className="font-medium text-slate-800">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-sm text-slate-600">{patient.id}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700">{patient.age}</td>
                      <td className="px-6 py-4 text-center text-slate-700">{patient.gender}</td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(patient.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/doctor/patient/${patient.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                        >
                          <Eye size={14} />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No patients found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filtered.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            Showing {filtered.length} of {patients.length} patients
          </div>
        )}
      </div>
    </div>
  );
}