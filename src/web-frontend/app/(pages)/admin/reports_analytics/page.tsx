"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Package,
  DollarSign,
  Filter,
  ShoppingCart,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  useGetDashboardAnalytics,
  useGetRevenueAnalytics,
  useGetAppointmentAnalytics,
  useGetInventoryAnalytics,
  useGetPatientGrowth,
  useGetDiagnosisDistribution,
  useGetTransactions,
  useGetTopSellingMedicines,
} from "@/app/_hooks/queries/useAnalytics";

export default function ReportsAnalyticsPage() {
  const [dateRange, setDateRange] = useState("month");

  // Calculate date range for API calls
  const dateParams = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(end.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [dateRange]);

  // Fetch real analytics data
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useGetDashboardAnalytics();
  const { data: revenueAnalytics, isLoading: isRevenueLoading } =
    useGetRevenueAnalytics({
      ...dateParams,
      groupBy:
        dateRange === "week" ? "day" : dateRange === "month" ? "day" : "month",
    });
  const { data: appointmentAnalytics, isLoading: isAppointmentLoading } =
    useGetAppointmentAnalytics(dateParams);
  const { data: inventoryAnalytics, isLoading: isInventoryLoading } =
    useGetInventoryAnalytics();
  const { data: patientGrowth, isLoading: isPatientGrowthLoading } =
    useGetPatientGrowth();
  const { data: diagnosisData, isLoading: isDiagnosisLoading } =
    useGetDiagnosisDistribution({ limit: 10 });
  const { data: transactionData, isLoading: isTransactionLoading } =
    useGetTransactions();
  const { data: topSellingData, isLoading: isTopSellingLoading } =
    useGetTopSellingMedicines({
      limit: 5,
      days:
        dateRange === "week"
          ? 7
          : dateRange === "month"
            ? 30
            : dateRange === "quarter"
              ? 90
              : 365,
    });

  const isLoading =
    isDashboardLoading ||
    isRevenueLoading ||
    isAppointmentLoading ||
    isInventoryLoading;

  const isInitialLoading = isLoading && !dashboardData && !revenueAnalytics;

  // Transform data for charts
  const stats = useMemo(
    () => ({
      totalPatients: dashboardData?.overview.totalPatients || 0,
      totalAppointments: dashboardData?.overview.totalAppointments || 0,
      completionRate: appointmentAnalytics?.byStatus
        ? Math.round(
            ((appointmentAnalytics.byStatus.completed || 0) /
              (appointmentAnalytics.total || 1)) *
              100
          )
        : 0,
      consultationRevenue: dashboardData?.month.consultationRevenue || 0,
      pharmacyRevenue: dashboardData?.month.medicineRevenue || 0,
      totalRevenue: dashboardData?.month.revenue || 0,
      totalTransactions: transactionData?.transactions?.length || 0,
    }),
    [dashboardData, transactionData, appointmentAnalytics]
  );

  // Transform revenue data for charts
  const revenueData = useMemo(() => {
    if (!revenueAnalytics?.groupedData) return [];
    return revenueAnalytics.groupedData.map((item) => ({
      month: item.period,
      consultation: item.consultationRevenue,
      pharmacy: item.medicineRevenue,
    }));
  }, [revenueAnalytics]);

  // Transform appointment data for trends chart
  const appointmentTrends = useMemo(() => {
    if (!appointmentAnalytics?.byDay || !appointmentAnalytics?.byStatus)
      return [];

    // Get last 7 data points
    const lastSevenDays = appointmentAnalytics.byDay.slice(-7);

    // Calculate proportions from overall status breakdown
    const total = Object.values(appointmentAnalytics.byStatus).reduce(
      (sum: number, count) => sum + (count as number),
      0
    );
    const completedRatio =
      (appointmentAnalytics.byStatus.completed || 0) / (total || 1);
    const cancelledRatio =
      (appointmentAnalytics.byStatus.cancelled || 0) / (total || 1);
    const pendingRatio =
      (appointmentAnalytics.byStatus.pending || 0) / (total || 1);

    return lastSevenDays.map((item) => {
      const date = new Date(item.date);
      const month = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        month,
        completed: Math.round(item.count * completedRatio),
        cancelled: Math.round(item.count * cancelledRatio),
        pending: Math.round(item.count * pendingRatio),
      };
    });
  }, [appointmentAnalytics]);

  // Top selling medicines from real sales data
  const topSellingMedicines = useMemo(() => {
    if (!topSellingData?.data) return [];

    return topSellingData.data.map((item) => ({
      medicine: item.medicine,
      sold: item.sold,
      revenue: item.revenue,
    }));
  }, [topSellingData]);

  // TODO: Add these endpoints to backend analytics.routes.ts
  const patientDemographics = [
    {
      age: "0-18",
      count: Math.floor((dashboardData?.overview.totalPatients || 0) * 0.13),
    },
    {
      age: "19-35",
      count: Math.floor((dashboardData?.overview.totalPatients || 0) * 0.34),
    },
    {
      age: "36-50",
      count: Math.floor((dashboardData?.overview.totalPatients || 0) * 0.24),
    },
    {
      age: "51-65",
      count: Math.floor((dashboardData?.overview.totalPatients || 0) * 0.17),
    },
    {
      age: "65+",
      count: Math.floor((dashboardData?.overview.totalPatients || 0) * 0.12),
    },
  ];

  // Use real diagnosis distribution data
  const diagnosisDistribution = useMemo(() => {
    if (!diagnosisData?.distribution) return [];
    return diagnosisData.distribution.map((item) => ({
      code: item.code,
      name: item.name,
      value: item.value,
      percentage: item.percentage,
      color: item.color,
    }));
  }, [diagnosisData]);

  // Use real transaction data
  const transactions = useMemo(() => {
    if (!transactionData?.transactions) return [];
    return transactionData.transactions.slice(0, 10); // Show latest 10
  }, [transactionData]);

  const predictiveTrends = [
    {
      month: "Jul",
      predicted:
        appointmentTrends[appointmentTrends.length - 1]?.completed * 1.05 || 0,
      actual: 0,
    },
    {
      month: "Aug",
      predicted:
        appointmentTrends[appointmentTrends.length - 1]?.completed * 1.08 || 0,
      actual: 0,
    },
    {
      month: "Sep",
      predicted:
        appointmentTrends[appointmentTrends.length - 1]?.completed * 1.1 || 0,
      actual: 0,
    },
  ];

  const handleDownloadPDF = () => {
    const printContent = document.getElementById("report-content");
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printArea = printContent.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>Clinic Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #14b8a6; border-bottom: 2px solid #14b8a6; padding-bottom: 10px; }
            h2 { color: #475569; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #14b8a6; color: white; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .stat-box { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .stat-label { font-size: 12px; color: #64748b; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0f172a; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h1>📊 Clinic Analytics Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Period: ${dateRange}</p>
          ${printArea}
        </body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleExportTransactions = () => {
    if (
      !transactionData?.transactions ||
      transactionData.transactions.length === 0
    ) {
      alert("No transaction data available to export");
      return;
    }

    const headers = [
      "Transaction ID",
      "Date",
      "Patient",
      "Type",
      "Amount",
      "Status",
    ];
    const csvRows = [
      headers.join(","),
      ...transactionData.transactions.map(
        (t: any) =>
          `${t.id},${t.date},${t.patient},${t.type},${t.amount},${t.status}`
      ),
    ];
    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportMedicines = () => {
    if (topSellingMedicines.length === 0) {
      alert("No medicine data available to export");
      return;
    }

    const headers = ["Medicine", "Units Sold", "Revenue"];
    const csvRows = [
      headers.join(","),
      ...topSellingMedicines.map((m) => `${m.medicine},${m.sold},${m.revenue}`),
    ];
    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `medicines_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportBehavior = () => {
    const headers = ["Behavior Type", "Count", "Percentage"];
    // TODO: Implement patient behavior analysis data
    const patientBehaviorAnalysis: any[] = [];
    const csvRows = [
      headers.join(","),
      ...patientBehaviorAnalysis.map(
        (b) => `${b.behavior},${b.count},${b.percentage}%`
      ),
    ];
    const csvContent = csvRows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `patient_behavior_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-teal-600" />
            Reports & Analytics
          </h1>
          <p className="text-slate-600">
            Comprehensive clinic performance insights
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isInitialLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
            <p className="text-slate-600 text-lg">Loading analytics data...</p>
          </div>
        )}

        {/* Print Content */}
        {!isInitialLoading && (
          <div id="report-content">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Total Patients
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.totalPatients.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Total Appointments
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.totalAppointments.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Completion Rate
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.completionRate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Consultation Revenue
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      ₱{stats.consultationRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Pharmacy Revenue
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      ₱{stats.pharmacyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Total Transactions
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {stats.totalTransactions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Appointment Trends */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Appointment Trends
                  </h2>
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={appointmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cancelled"
                      stroke="#dc2626"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Revenue Breakdown
                  </h2>
                  <DollarSign className="w-5 h-5 text-teal-600" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) =>
                        `₱${value.toLocaleString()}`
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="consultation"
                      fill="#14b8a6"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="pharmacy"
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Patient Demographics */}
              {/* TODO: Add patient age demographics when date of birth data is available
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Patient Demographics</h2>
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patientDemographics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="age" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            */}

              {/* Diagnosis Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Diagnosis Distribution
                  </h2>
                  <Activity className="w-5 h-5 text-teal-600" />
                </div>
                {isDiagnosisLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  </div>
                ) : diagnosisDistribution.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No diagnosis data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={diagnosisDistribution}
                        dataKey="value"
                        nameKey="code"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) => entry.code || "N/A"}
                      >
                        {diagnosisDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 max-w-xs">
                                <p className="font-semibold text-slate-800">
                                  {data.code}
                                </p>
                                <p className="text-sm text-slate-600 whitespace-normal wrap-break-word">
                                  {data.name}
                                </p>
                                <p className="text-sm text-teal-600 font-medium mt-1">
                                  Count: {data.value} ({data.percentage}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Predictive Analytics */}
            {/* TODO: Implement predictive analytics with ML model
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Predictive Analytics</h2>
                <p className="text-sm text-slate-600">Forecasted patient volume for next 3 months</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[...appointmentTrends.slice(-3), ...predictiveTrends]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          */}

            {/* Tables Section */}
            <div className="space-y-6">
              {/* Top Selling Medicines */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Top Selling Medicines
                  </h2>
                  <button
                    onClick={handleExportMedicines}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                          Medicine
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                          Units Sold
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {topSellingMedicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-800">
                            {med.medicine}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-slate-700">
                            {med.sold}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-slate-700">
                            ₱{med.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Recent Transactions
                  </h2>
                  <button
                    onClick={handleExportTransactions}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                          Transaction ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                          Patient
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                          Type
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {isTransactionLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                            <p className="mt-2 text-sm text-slate-600">
                              Loading transactions...
                            </p>
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-slate-500"
                          >
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-sm font-mono text-slate-800">
                              {transaction.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {transaction.date}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              {transaction.patientName}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  transaction.type === "Consultation"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {transaction.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-slate-700">
                              ₱{transaction.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  transaction.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {transaction.status === "completed"
                                  ? "Paid"
                                  : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Insights Summary */}
            {/* TODO: Generate insights from real data analysis
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1"> Revenue Growth</p>
                <p className="text-lg font-semibold text-slate-800">Pharmacy revenue is growing 18% faster than consultations</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Top Sold Medicines</p>
                <p className="text-lg font-semibold text-slate-800">Paracetamol leads with 245 units sold (+15%)</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Patient Behavior</p>
                <p className="text-lg font-semibold text-slate-800">41% of visits are regular checkups - highest category</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Forecast</p>
                <p className="text-lg font-semibold text-slate-800">Predicted 182 patients next month (+8% growth)</p>
              </div>
            </div>
          </div>
          */}
          </div>
        )}
      </div>
    </div>
  );
}
