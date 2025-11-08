"use client";

import { Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { Patient } from "./PatientQueue";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <div className={color}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  patients: Patient[];
}

export default function StatsCards({ patients }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Waiting",
      value: patients.filter(p => p.status === "waiting").length,
      icon: <Clock className="w-6 h-6" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Completed",
      value: patients.filter(p => p.status === "done").length,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Cancelled",
      value: patients.filter(p => p.status === "cancelled").length,
      icon: <XCircle className="w-6 h-6" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}