"use client";

import { useState } from "react";
import Map from "@/app/_components/Map";
import Announcements from "./_components/Announcements";
import MyAppointment from "./_components/MyAppointment";
import SmallCalendar from "../../admin/_components/SmallCalendar";
import { MapPin } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Welcome Back!
          </h1>
          <p className="text-slate-600">
            Here's what's happening with your health today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <MyAppointment />
            <Announcements />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <SmallCalendar />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-teal-600" />
                Clinic Location
              </h2>

              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <Map />
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <p className="font-medium text-slate-800">
                  J.A.U. Medical Clinic
                </p>
                <p>
                  Unit 8 A-1, Commercial Center, Centennial Town Homes, Putol
                  St{" "}
                </p>
                <p>Cabuyao City, 4025 Laguna</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
