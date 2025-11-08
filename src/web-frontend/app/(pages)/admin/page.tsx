"use client";

import { Activity } from "lucide-react";
import StatsCards from "@/app/(pages)/admin/_components/StatsCards";
import DoctorList from "@/app/(pages)/admin/_components/DoctorList";
import PatientsGraph from "@/app/(pages)/admin/_components/PatientGraph";
import DiagnosisGraph from "@/app/(pages)/admin/_components/DiagnosisGraph";
import InventoryGraph from "@/app/(pages)/admin/_components/InventoryGraph";
import TopMedicine from "@/app/(pages)/admin/_components/TopMedicine";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-teal-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards />

          {/* Doctor List */}
          <DoctorList />

          {/* Graphs Section Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientsGraph />
            <DiagnosisGraph />
          </div>

          {/* Graphs Section Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryGraph />
            <TopMedicine />
          </div>
        </div>
      </div>
    </div>
  );
}