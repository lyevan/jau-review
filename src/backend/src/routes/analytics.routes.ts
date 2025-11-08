import { Router } from "express";
import { db } from "../db/index.js";
import {
  users,
  patientProfiles,
  doctorProfiles,
  appointments,
  medicines,
  medicineSales,
  medicineSaleItems,
  consultationPayments,
  visits,
  visitDiagnoses,
} from "../db/schema.js";
import { eq, gte, lte, and, sql, count, inArray, desc } from "drizzle-orm";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/analytics/dashboard - Get comprehensive dashboard statistics
router.get("/dashboard", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view analytics
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    // Get total counts
    const [totalPatientsResult] = await db
      .select({ count: count() })
      .from(patientProfiles);

    const [totalDoctorsResult] = await db
      .select({ count: count() })
      .from(doctorProfiles);

    const [totalAppointmentsResult] = await db
      .select({ count: count() })
      .from(appointments);

    const [totalVisitsResult] = await db
      .select({ count: count() })
      .from(visits);

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppointmentsResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.date, today.toISOString().split("T")[0]),
          lte(appointments.date, tomorrow.toISOString().split("T")[0])
        )
      );

    // Get pending appointments
    const [pendingAppointmentsResult] = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, "pending"));

    // Get today's revenue from medicine sales
    const todayMedicineSales = await db
      .select()
      .from(medicineSales)
      .where(
        and(
          gte(medicineSales.createdAt, today),
          lte(medicineSales.createdAt, tomorrow)
        )
      );

    const todayMedicineRevenue = todayMedicineSales.reduce(
      (sum, sale) => sum + parseFloat(sale.total.toString()),
      0
    );

    // Get today's revenue from consultations
    const todayConsultations = await db
      .select()
      .from(consultationPayments)
      .where(
        and(
          gte(consultationPayments.dateProcessed, today),
          lte(consultationPayments.dateProcessed, tomorrow)
        )
      );

    const todayConsultationRevenue = todayConsultations.reduce(
      (sum, payment) => sum + parseFloat(payment.totalAmount.toString()),
      0
    );

    const todayTotalRevenue = todayMedicineRevenue + todayConsultationRevenue;

    // Get monthly revenue (current month)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const monthMedicineSales = await db
      .select()
      .from(medicineSales)
      .where(
        and(
          gte(medicineSales.createdAt, monthStart),
          lte(medicineSales.createdAt, monthEnd)
        )
      );

    const monthMedicineRevenue = monthMedicineSales.reduce(
      (sum, sale) => sum + parseFloat(sale.total.toString()),
      0
    );

    const monthConsultations = await db
      .select()
      .from(consultationPayments)
      .where(
        and(
          gte(consultationPayments.dateProcessed, monthStart),
          lte(consultationPayments.dateProcessed, monthEnd)
        )
      );

    const monthConsultationRevenue = monthConsultations.reduce(
      (sum, payment) => sum + parseFloat(payment.totalAmount.toString()),
      0
    );

    const monthTotalRevenue = monthMedicineRevenue + monthConsultationRevenue;

    // Get low stock medicines
    const lowStockMedicines = await db
      .select()
      .from(medicines)
      .where(sql`${medicines.stock} <= ${medicines.minStock}`);

    // Get recent appointments (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAppointments = await db
      .select()
      .from(appointments)
      .where(gte(appointments.date, sevenDaysAgo.toISOString().split("T")[0]));

    // Group appointments by status
    const appointmentsByStatus = recentAppointments.reduce((acc, apt) => {
      const status = apt.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return res.json({
      status: true,
      result: {
        overview: {
          totalPatients: totalPatientsResult.count,
          totalDoctors: totalDoctorsResult.count,
          totalAppointments: totalAppointmentsResult.count,
          totalVisits: totalVisitsResult.count,
          pendingAppointments: pendingAppointmentsResult.count,
        },
        today: {
          appointments: todayAppointmentsResult.count,
          revenue: todayTotalRevenue,
          medicineRevenue: todayMedicineRevenue,
          consultationRevenue: todayConsultationRevenue,
          medicineSalesCount: todayMedicineSales.length,
          consultationPaymentsCount: todayConsultations.length,
        },
        month: {
          revenue: monthTotalRevenue,
          medicineRevenue: monthMedicineRevenue,
          consultationRevenue: monthConsultationRevenue,
          medicineSalesCount: monthMedicineSales.length,
          consultationPaymentsCount: monthConsultations.length,
        },
        inventory: {
          lowStockCount: lowStockMedicines.length,
          lowStockMedicines: lowStockMedicines.map((med) => ({
            id: med.id,
            name: med.name,
            stock: med.stock,
            reorderLevel: med.minStock,
          })),
        },
        appointments: {
          byStatus: appointmentsByStatus,
          recent: recentAppointments.length,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard analytics:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch dashboard analytics",
    });
  }
});

// GET /api/analytics/revenue - Get revenue statistics
router.get("/revenue", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view revenue analytics
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const { startDate, endDate, groupBy } = req.query;

    // Default to last 30 days if no dates provided
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const start = startDate ? new Date(startDate as string) : thirtyDaysAgo;
    const end = endDate ? new Date(endDate as string) : today;

    // Get medicine sales in range
    const medicineSalesData = await db
      .select()
      .from(medicineSales)
      .where(
        and(
          gte(medicineSales.createdAt, start),
          lte(medicineSales.createdAt, end)
        )
      );

    // Get consultation payments in range
    const consultationPaymentsData = await db
      .select()
      .from(consultationPayments)
      .where(
        and(
          gte(consultationPayments.dateProcessed, start),
          lte(consultationPayments.dateProcessed, end)
        )
      );

    // Calculate totals
    const totalMedicineRevenue = medicineSalesData.reduce(
      (sum, sale) => sum + parseFloat(sale.total.toString()),
      0
    );

    const totalConsultationRevenue = consultationPaymentsData.reduce(
      (sum, payment) => sum + parseFloat(payment.totalAmount.toString()),
      0
    );

    const totalRevenue = totalMedicineRevenue + totalConsultationRevenue;

    // Group by day, week, or month if requested
    let groupedData: any[] = [];

    if (groupBy === "day" || groupBy === "week" || groupBy === "month") {
      // Combine all transactions
      const allTransactions = [
        ...medicineSalesData.map((sale) => ({
          date: sale.createdAt,
          amount: parseFloat(sale.total.toString()),
          type: "medicine",
        })),
        ...consultationPaymentsData.map((payment) => ({
          date: payment.dateProcessed,
          amount: parseFloat(payment.totalAmount.toString()),
          type: "consultation",
        })),
      ];

      // Group by specified period
      const grouped = allTransactions.reduce((acc, transaction) => {
        if (!transaction.date) return acc;

        let key: string;
        const date = new Date(transaction.date);

        if (groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        }

        if (!acc[key]) {
          acc[key] = {
            period: key,
            medicineRevenue: 0,
            consultationRevenue: 0,
            totalRevenue: 0,
            count: 0,
          };
        }

        if (transaction.type === "medicine") {
          acc[key].medicineRevenue += transaction.amount;
        } else {
          acc[key].consultationRevenue += transaction.amount;
        }

        acc[key].totalRevenue += transaction.amount;
        acc[key].count += 1;

        return acc;
      }, {} as Record<string, any>);

      groupedData = Object.values(grouped).sort((a, b) =>
        a.period.localeCompare(b.period)
      );
    }

    return res.json({
      status: true,
      result: {
        summary: {
          totalRevenue,
          medicineRevenue: totalMedicineRevenue,
          consultationRevenue: totalConsultationRevenue,
          medicineSalesCount: medicineSalesData.length,
          consultationPaymentsCount: consultationPaymentsData.length,
        },
        dateRange: {
          startDate: start,
          endDate: end,
        },
        groupedData: groupBy ? groupedData : undefined,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching revenue analytics:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch revenue analytics",
    });
  }
});

// GET /api/analytics/appointments - Get appointment statistics
router.get(
  "/appointments",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;

      // Only admin and staff can view appointment analytics
      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const { startDate, endDate } = req.query;

      // Default to last 30 days if no dates provided
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const start = startDate ? new Date(startDate as string) : thirtyDaysAgo;
      const end = endDate ? new Date(endDate as string) : today;

      // Get appointments in range
      const appointmentsData = await db
        .select()
        .from(appointments)
        .where(
          and(
            gte(appointments.date, start.toISOString().split("T")[0]),
            lte(appointments.date, end.toISOString().split("T")[0])
          )
        );

      // Group by status
      const byStatus = appointmentsData.reduce((acc, apt) => {
        const status = apt.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group by doctor
      const byDoctor = appointmentsData.reduce((acc, apt) => {
        acc[apt.doctorId] = (acc[apt.doctorId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Group by day
      const byDay = appointmentsData.reduce((acc, apt) => {
        const day = apt.date; // Already a date string YYYY-MM-DD
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return res.json({
        status: true,
        result: {
          total: appointmentsData.length,
          byStatus,
          byDoctor,
          byDay: Object.entries(byDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          dateRange: {
            startDate: start,
            endDate: end,
          },
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching appointment analytics:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch appointment analytics",
      });
    }
  }
);

// GET /api/analytics/inventory - Get inventory statistics
router.get("/inventory", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view inventory analytics
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    // Get all medicines
    const allMedicines = await db.select().from(medicines);

    // Get low stock medicines
    const lowStockMedicines = allMedicines.filter(
      (med) => med.stock <= med.minStock
    );

    // Get out of stock medicines
    const outOfStockMedicines = allMedicines.filter((med) => med.stock === 0);

    // Group by category
    const byCategory = allMedicines.reduce((acc, med) => {
      const category = med.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalValue: 0,
          lowStock: 0,
        };
      }
      acc[category].count += 1;
      acc[category].totalValue += med.stock * parseFloat(med.price.toString());
      if (med.stock <= med.minStock) {
        acc[category].lowStock += 1;
      }
      return acc;
    }, {} as Record<string, { count: number; totalValue: number; lowStock: number }>);

    // Calculate total inventory value
    const totalInventoryValue = allMedicines.reduce(
      (sum, med) => sum + med.stock * parseFloat(med.price.toString()),
      0
    );

    return res.json({
      status: true,
      result: {
        total: allMedicines.length,
        lowStockCount: lowStockMedicines.length,
        outOfStockCount: outOfStockMedicines.length,
        totalInventoryValue,
        byCategory,
        lowStockMedicines: lowStockMedicines.map((med) => ({
          id: med.id,
          name: med.name,
          stock: med.stock,
          reorderLevel: med.minStock,
          category: med.category,
        })),
        outOfStockMedicines: outOfStockMedicines.map((med) => ({
          id: med.id,
          name: med.name,
          category: med.category,
        })),
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching inventory analytics:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch inventory analytics",
    });
  }
});

// GET /api/analytics/patient-growth - Get patient registration trends
router.get(
  "/patient-growth",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;

      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const { startDate, endDate } = req.query;

      // Default to last 12 months
      const today = new Date();
      const twelveMonthsAgo = new Date(today);
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const start = startDate ? new Date(startDate as string) : twelveMonthsAgo;
      const end = endDate ? new Date(endDate as string) : today;

      // Get all patients with their registration dates
      const allPatients = await db
        .select({
          id: patientProfiles.id,
          userId: patientProfiles.userId,
        })
        .from(patientProfiles);

      // Get user registration dates
      const patientUserIds = allPatients.map((p) => p.userId);

      if (patientUserIds.length === 0) {
        return res.json({
          status: true,
          result: {
            totalPatients: 0,
            groupedData: [],
          },
          error: null,
        });
      }

      const patientUsers = await db
        .select({
          id: users.id,
          dateJoined: users.dateJoined,
        })
        .from(users)
        .where(
          and(
            inArray(users.id, patientUserIds),
            gte(users.dateJoined, start),
            lte(users.dateJoined, end)
          )
        );

      // Group by month - use UTC to avoid timezone issues
      const groupedByMonth = patientUsers.reduce((acc, user) => {
        if (!user.dateJoined) return acc;
        const date = new Date(user.dateJoined);
        const monthKey = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          timeZone: "UTC",
        });
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const growthData = Object.entries(groupedByMonth).map(
        ([month, count]) => ({
          month,
          count,
        })
      );

      return res.json({
        status: true,
        result: {
          totalPatients: patientUsers.length,
          groupedData: growthData,
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching patient growth:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch patient growth analytics",
      });
    }
  }
);

// GET /api/analytics/diagnosis-distribution - Get top diagnoses
router.get(
  "/diagnosis-distribution",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;

      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const { startDate, endDate, limit = 10 } = req.query;

      // Default to last 6 months
      const today = new Date();
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const start = startDate ? new Date(startDate as string) : sixMonthsAgo;
      const end = endDate ? new Date(endDate as string) : today;

      // Get visits in date range
      const visitsInRange = await db
        .select({ id: visits.id })
        .from(visits)
        .where(and(gte(visits.date, start), lte(visits.date, end)));

      const visitIds = visitsInRange.map((v) => v.id);

      if (visitIds.length === 0) {
        return res.json({
          status: true,
          result: {
            total: 0,
            distribution: [],
          },
          error: null,
        });
      }

      // Get all diagnoses for these visits
      const diagnoses = await db
        .select()
        .from(visitDiagnoses)
        .where(inArray(visitDiagnoses.visitId, visitIds));

      // Count by ICD-10 code only (to aggregate same codes with different descriptions)
      const diagnosisCounts = diagnoses.reduce((acc, diag) => {
        const code = diag.diagnosisCode || "N/A";
        const name = diag.diagnosisDescription || "Unknown";

        if (!acc[code]) {
          acc[code] = { name, code, count: 0 };
        }
        acc[code].count++;
        return acc;
      }, {} as Record<string, { name: string; code: string; count: number }>);

      // Sort by count and get top diagnoses
      const sortedDiagnoses = Object.values(diagnosisCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, Number(limit));

      // Calculate percentages
      const total = diagnoses.length;
      const distribution = sortedDiagnoses.map((diag, index) => ({
        name: diag.name,
        code: diag.code,
        value: diag.count,
        percentage: ((diag.count / total) * 100).toFixed(1),
        color: getColorForIndex(index),
      }));

      return res.json({
        status: true,
        result: {
          total,
          distribution,
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching diagnosis distribution:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch diagnosis distribution",
      });
    }
  }
);

// GET /api/analytics/transactions - Get transaction history
router.get(
  "/transactions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;

      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const { startDate, endDate, type } = req.query;

      // Default to last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const start = startDate ? new Date(startDate as string) : thirtyDaysAgo;
      const end = endDate ? new Date(endDate as string) : today;

      let transactions: any[] = [];

      // Get consultation payments
      if (!type || type === "consultation") {
        const consultations = await db
          .select({
            id: consultationPayments.id,
            amount: consultationPayments.totalAmount,
            date: consultationPayments.dateProcessed,
            patientId: consultationPayments.patientId,
          })
          .from(consultationPayments)
          .where(
            and(
              gte(consultationPayments.dateProcessed, start),
              lte(consultationPayments.dateProcessed, end)
            )
          );

        transactions.push(
          ...consultations.map((c) => ({
            id: `consultation-${c.id}`,
            type: "Consultation",
            amount: parseFloat(c.amount.toString()),
            date: c.date
              ? new Date(c.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: "completed", // All processed payments are completed
            patientId: c.patientId,
          }))
        );
      }

      // Get medicine sales
      if (!type || type === "pharmacy") {
        const sales = await db
          .select({
            id: medicineSales.id,
            amount: medicineSales.total,
            date: medicineSales.createdAt,
          })
          .from(medicineSales)
          .where(
            and(
              gte(medicineSales.createdAt, start),
              lte(medicineSales.createdAt, end)
            )
          );

        transactions.push(
          ...sales.map((s) => ({
            id: `pharmacy-${s.id}`,
            type: "Pharmacy",
            amount: parseFloat(s.amount.toString()),
            date: s.date
              ? new Date(s.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: "completed",
            patientId: null, // Medicine sales don't have patient ID
          }))
        );
      }

      // Get patient names
      const patientIds = [
        ...new Set(transactions.map((t) => t.patientId).filter(Boolean)),
      ] as number[];

      let patientMap: Record<number, string> = {};
      if (patientIds.length > 0) {
        const patientsWithUsers = await db
          .select({
            patientId: patientProfiles.id,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(patientProfiles)
          .innerJoin(users, eq(patientProfiles.userId, users.id))
          .where(inArray(patientProfiles.id, patientIds));

        // Map patient names
        patientMap = patientsWithUsers.reduce((acc, p) => {
          acc[p.patientId] = `${p.firstName} ${p.lastName}`;
          return acc;
        }, {} as Record<number, string>);
      }

      // Enrich transactions with patient names
      const enrichedTransactions = transactions.map((t) => ({
        ...t,
        patientName: t.patientId
          ? patientMap[t.patientId] || "Unknown"
          : "Walk-in",
      }));

      // Sort by date descending
      enrichedTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return res.json({
        status: true,
        result: {
          total: enrichedTransactions.length,
          transactions: enrichedTransactions,
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch transactions",
      });
    }
  }
);

// GET /api/analytics/wait-time - Get average appointment wait time
router.get("/wait-time", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    // Get completed appointments from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedAppointments = await db
      .select({
        id: appointments.id,
        date: appointments.date,
        startTime: appointments.startTime,
        updatedAt: appointments.updatedAt,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.status, "completed"),
          gte(appointments.date, thirtyDaysAgo.toISOString().split("T")[0])
        )
      );

    if (completedAppointments.length === 0) {
      return res.json({
        status: true,
        result: {
          averageWaitTime: 0,
          appointmentsAnalyzed: 0,
        },
        error: null,
      });
    }

    // Calculate wait times (difference between scheduled start and completion)
    let totalWaitMinutes = 0;
    let validAppointments = 0;

    for (const apt of completedAppointments) {
      if (!apt.updatedAt) continue;

      // Scheduled time
      const scheduledDateTime = new Date(`${apt.date}T${apt.startTime}`);
      const completedDateTime = new Date(apt.updatedAt);

      const waitMinutes =
        (completedDateTime.getTime() - scheduledDateTime.getTime()) /
        (1000 * 60);

      // Only count positive wait times (completed after scheduled)
      if (waitMinutes > 0 && waitMinutes < 480) {
        // Max 8 hours to filter outliers
        totalWaitMinutes += waitMinutes;
        validAppointments++;
      }
    }

    const averageWaitTime =
      validAppointments > 0
        ? Math.round(totalWaitMinutes / validAppointments)
        : 0;

    return res.json({
      status: true,
      result: {
        averageWaitTime,
        appointmentsAnalyzed: validAppointments,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error calculating wait time:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to calculate wait time",
    });
  }
});

// Helper function for consistent colors
function getColorForIndex(index: number): string {
  const colors = [
    "#f97316", // orange
    "#3b82f6", // blue
    "#16a34a", // green
    "#eab308", // yellow
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f59e0b", // amber
    "#06b6d4", // cyan
    "#84cc16", // lime
  ];
  return colors[index % colors.length];
}

// GET /api/analytics/top-selling-medicines - Get top selling medicines with sales data
router.get(
  "/top-selling-medicines",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const days = parseInt(req.query.days as string) || 30;

      // Calculate date range
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);

      // Query medicine sale items with aggregation
      const topSellingData = await db
        .select({
          medicineId: medicineSaleItems.medicineId,
          medicineName: medicines.name,
          brandName: medicines.brandName,
          genericName: medicines.genericName,
          totalQuantity: sql<number>`SUM(${medicineSaleItems.quantity})`.as(
            "total_quantity"
          ),
          totalRevenue: sql<number>`SUM(${medicineSaleItems.subtotal})`.as(
            "total_revenue"
          ),
          transactionCount:
            sql<number>`COUNT(DISTINCT ${medicineSaleItems.saleId})`.as(
              "transaction_count"
            ),
        })
        .from(medicineSaleItems)
        .innerJoin(medicines, eq(medicineSaleItems.medicineId, medicines.id))
        .innerJoin(
          medicineSales,
          eq(medicineSaleItems.saleId, medicineSales.id)
        )
        .where(
          and(
            gte(medicineSales.createdAt, start),
            lte(medicineSales.createdAt, end)
          )
        )
        .groupBy(
          medicineSaleItems.medicineId,
          medicines.name,
          medicines.brandName,
          medicines.genericName
        )
        .orderBy(desc(sql`SUM(${medicineSaleItems.quantity})`))
        .limit(limit);

      // Format the response
      const formattedData = topSellingData.map((item, index) => ({
        rank: index + 1,
        medicineId: item.medicineId,
        medicine: item.medicineName,
        brandName: item.brandName,
        genericName: item.genericName,
        sold: Number(item.totalQuantity),
        revenue: Number(item.totalRevenue),
        transactions: Number(item.transactionCount),
      }));

      res.json({
        status: true,
        result: {
          data: formattedData,
          period: {
            days,
            start: start.toISOString(),
            end: end.toISOString(),
          },
        },
        error: null,
      });
    } catch (error: any) {
      console.error("Error fetching top selling medicines:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch top selling medicines",
      });
    }
  }
);

export default router;
