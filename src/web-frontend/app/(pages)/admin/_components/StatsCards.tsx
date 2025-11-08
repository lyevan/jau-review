"use client";

import {
  CircleCheckBig,
  CircleX,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  Package,
} from "lucide-react";
import { useGetDashboardAnalytics } from "@/app/_hooks/queries/useAnalytics";

interface StatCardProps {
  title: string;
  value: number;
  percentage: string;
  trend: "up" | "down";
  color: string;
  icon: React.ComponentType<{ size?: number }>;
}

function StatCard({
  title,
  value,
  percentage,
  trend,
  color,
  icon: Icon,
}: StatCardProps) {
  const styleMap: Record<
    string,
    { gradient: string; iconBg: string; iconColor: string; accentColor: string }
  > = {
    green: {
      gradient: "from-emerald-50 via-teal-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      iconColor: "text-white",
      accentColor: "text-emerald-600",
    },
    red: {
      gradient: "from-rose-50 via-pink-50 to-red-50",
      iconBg: "bg-gradient-to-br from-rose-400 to-red-500",
      iconColor: "text-white",
      accentColor: "text-rose-600",
    },
    blue: {
      gradient: "from-blue-50 via-indigo-50 to-purple-50",
      iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
      iconColor: "text-white",
      accentColor: "text-blue-600",
    },
  };

  const styles = styleMap[color];

  return (
    <div
      className={`bg-gradient-to-br ${styles.gradient} rounded-2xl shadow-lg border border-slate-200 p-6 transform hover:scale-105 hover:shadow-xl transition-all duration-200 cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
          <p className={`text-5xl font-bold ${styles.accentColor}`}>{value}</p>
        </div>
        <div
          className={`${styles.iconBg} rounded-xl p-3 shadow-md ${styles.iconColor}`}
        >
          <Icon size={40} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-600">
        {trend === "up" ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm font-medium">{percentage}</span>
      </div>
    </div>
  );
}

export default function StatsCards() {
  const { data: analytics, isLoading } = useGetDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-12 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const todayRevenue = analytics?.today?.revenue || 0;
  const monthRevenue = analytics?.month?.revenue || 0;
  const revenueChange =
    monthRevenue > 0
      ? ((todayRevenue / (monthRevenue / 30)) * 100 - 100).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Patients"
        value={analytics?.overview?.totalPatients || 0}
        percentage={`${analytics?.overview?.totalDoctors || 0} doctors`}
        trend="up"
        color="blue"
        icon={Users}
      />
      <StatCard
        title="Today's Appointments"
        value={analytics?.today?.appointments || 0}
        percentage={`${analytics?.overview?.pendingAppointments || 0} pending`}
        trend="up"
        color="green"
        icon={Calendar}
      />
      <StatCard
        title="Today's Revenue"
        value={Math.round(todayRevenue)}
        percentage={`₱${monthRevenue.toFixed(0)} this month`}
        trend={parseFloat(revenueChange) >= 0 ? "up" : "down"}
        color="green"
        icon={DollarSign}
      />
      <StatCard
        title="Low Stock Items"
        value={analytics?.inventory?.lowStockCount || 0}
        percentage={`${analytics?.inventory?.lowStockMedicines?.length || 0} medicines`}
        trend={analytics?.inventory?.lowStockCount ? "down" : "up"}
        color={analytics?.inventory?.lowStockCount ? "red" : "green"}
        icon={Package}
      />
    </div>
  );
}
