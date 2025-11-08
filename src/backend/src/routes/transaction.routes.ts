import { Router } from "express";
import { db } from "../db/index.js";
import {
  medicineSales,
  medicineSaleItems,
  medicines,
  consultationPayments,
  users,
  patientProfiles,
  doctorProfiles,
} from "../db/schema.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/transactions - Get unified transaction list (medicine sales + consultation payments)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view transactions
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const { type, startDate, endDate, limit } = req.query;

    const transactions: any[] = [];

    // Fetch medicine sales if type is not "consultation"
    if (!type || type === "medicine") {
      const conditions = [];

      if (startDate) {
        conditions.push(
          gte(medicineSales.createdAt, new Date(startDate as string))
        );
      }

      if (endDate) {
        conditions.push(
          lte(medicineSales.createdAt, new Date(endDate as string))
        );
      }

      let salesQuery = db
        .select({
          id: medicineSales.id,
          totalAmount: medicineSales.total,
          date: medicineSales.createdAt,
          processedById: medicineSales.processedById,
          processedByFirstName: users.firstName,
          processedByLastName: users.lastName,
          subtotal: medicineSales.subtotal,
          tax: medicineSales.tax,
          discountType: medicineSales.discountType,
          discountIdNumber: medicineSales.discountIdNumber,
          discountPatientName: medicineSales.discountPatientName,
          cash: medicineSales.cash,
          change: medicineSales.change,
        })
        .from(medicineSales)
        .leftJoin(users, eq(medicineSales.processedById, users.id))
        .orderBy(desc(medicineSales.createdAt));

      if (conditions.length > 0) {
        salesQuery = salesQuery.where(and(...conditions)) as any;
      }

      if (limit) {
        salesQuery = salesQuery.limit(parseInt(limit as string)) as any;
      }

      const medicineSalesData = await salesQuery;

      // Fetch items for each medicine sale
      for (const sale of medicineSalesData) {
        const items = await db
          .select({
            id: medicineSaleItems.id,
            medicineId: medicineSaleItems.medicineId,
            name: medicines.name,
            brandName: medicines.brandName,
            genericName: medicines.genericName,
            quantity: medicineSaleItems.quantity,
            price: medicineSaleItems.price,
          })
          .from(medicineSaleItems)
          .leftJoin(medicines, eq(medicineSaleItems.medicineId, medicines.id))
          .where(eq(medicineSaleItems.saleId, sale.id));

        transactions.push({
          ...sale,
          type: "medicine",
          description: "Medicine Sale",
          items: items,
        });
      }
    }

    // Fetch consultation payments if type is not "medicine"
    if (!type || type === "consultation") {
      const conditions = [];

      if (startDate) {
        conditions.push(
          gte(consultationPayments.dateProcessed, new Date(startDate as string))
        );
      }

      if (endDate) {
        conditions.push(
          lte(consultationPayments.dateProcessed, new Date(endDate as string))
        );
      }

      let paymentsQuery = db
        .select({
          id: consultationPayments.id,
          transactionId: consultationPayments.transactionId,
          patientId: consultationPayments.patientId,
          doctorId: consultationPayments.doctorId,
          totalAmount: consultationPayments.totalAmount,
          subtotal: consultationPayments.consultationFee,
          tax: consultationPayments.tax,
          cash: consultationPayments.cash,
          change: consultationPayments.change,
          paymentMethod: consultationPayments.paymentMethod,
          date: consultationPayments.dateProcessed,
          processedById: consultationPayments.processedById,
          discountType: consultationPayments.discountType,
          discountIdNumber: consultationPayments.discountIdNumber,
          discountPatientName: consultationPayments.discountPatientName,
          patientFirstName: users.firstName,
          patientLastName: users.lastName,
        })
        .from(consultationPayments)
        .leftJoin(
          patientProfiles,
          eq(consultationPayments.patientId, patientProfiles.id)
        )
        .leftJoin(users, eq(patientProfiles.userId, users.id))
        .orderBy(desc(consultationPayments.dateProcessed));

      if (conditions.length > 0) {
        paymentsQuery = paymentsQuery.where(and(...conditions)) as any;
      }

      if (limit) {
        paymentsQuery = paymentsQuery.limit(parseInt(limit as string)) as any;
      }

      const consultationPaymentsData = await paymentsQuery;

      // Fetch processed by user info and doctor info for each consultation payment
      for (const payment of consultationPaymentsData) {
        let processedByFirstName = null;
        let processedByLastName = null;
        let doctorFirstName = null;
        let doctorLastName = null;

        if (payment.processedById) {
          const [processedByUser] = await db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
            })
            .from(users)
            .where(eq(users.id, payment.processedById));

          if (processedByUser) {
            processedByFirstName = processedByUser.firstName;
            processedByLastName = processedByUser.lastName;
          }
        }

        // Fetch doctor information
        if (payment.doctorId) {
          const [doctor] = await db
            .select({
              firstName: users.firstName,
              lastName: users.lastName,
            })
            .from(doctorProfiles)
            .leftJoin(users, eq(doctorProfiles.userId, users.id))
            .where(eq(doctorProfiles.id, payment.doctorId));

          if (doctor) {
            doctorFirstName = doctor.firstName;
            doctorLastName = doctor.lastName;
          }
        }

        transactions.push({
          ...payment,
          processedByFirstName,
          processedByLastName,
          doctorFirstName,
          doctorLastName,
          type: "consultation",
          description: "Consultation Payment",
        });
      }
    }

    // Sort all transactions by date (most recent first)
    transactions.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply limit if specified
    let finalTransactions = transactions;
    if (limit) {
      finalTransactions = transactions.slice(0, parseInt(limit as string));
    }

    return res.json({
      status: true,
      result: finalTransactions,
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
});

// GET /api/transactions/summary - Get transaction summary statistics
router.get("/summary", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view summary
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const { startDate, endDate } = req.query;

    // Default to today if no dates provided
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const start = startDate ? new Date(startDate as string) : today;
    const end = endDate ? new Date(endDate as string) : tomorrow;

    // Get medicine sales in date range
    const medicineSalesData = await db
      .select()
      .from(medicineSales)
      .where(
        and(
          gte(medicineSales.createdAt, start),
          lte(medicineSales.createdAt, end)
        )
      );

    const totalMedicineSales = medicineSalesData.length;
    const totalMedicineRevenue = medicineSalesData.reduce(
      (sum, sale) => sum + parseFloat(sale.total.toString()),
      0
    );

    // Get consultation payments in date range
    const consultationPaymentsData = await db
      .select()
      .from(consultationPayments)
      .where(
        and(
          gte(consultationPayments.dateProcessed, start),
          lte(consultationPayments.dateProcessed, end)
        )
      );

    const totalConsultationPayments = consultationPaymentsData.length;
    const totalConsultationRevenue = consultationPaymentsData.reduce(
      (sum, payment) => sum + parseFloat(payment.totalAmount.toString()),
      0
    );

    // Calculate totals
    const totalTransactions = totalMedicineSales + totalConsultationPayments;
    const totalRevenue = totalMedicineRevenue + totalConsultationRevenue;

    return res.json({
      status: true,
      result: {
        totalTransactions,
        totalRevenue,
        medicineSales: {
          count: totalMedicineSales,
          revenue: totalMedicineRevenue,
        },
        consultationPayments: {
          count: totalConsultationPayments,
          revenue: totalConsultationRevenue,
        },
        dateRange: {
          startDate: start,
          endDate: end,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching transaction summary:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch transaction summary",
    });
  }
});

// GET /api/transactions/today - Get today's transactions
router.get("/today", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view today's transactions
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions: any[] = [];

    // Get today's medicine sales
    const medicineSalesData = await db
      .select({
        id: medicineSales.id,
        totalAmount: medicineSales.total,
        date: medicineSales.createdAt,
        processedById: medicineSales.processedById,
        subtotal: medicineSales.subtotal,
        tax: medicineSales.tax,
      })
      .from(medicineSales)
      .where(
        and(
          gte(medicineSales.createdAt, today),
          lte(medicineSales.createdAt, tomorrow)
        )
      );

    medicineSalesData.forEach((sale) => {
      transactions.push({
        ...sale,
        type: "medicine",
        description: "Medicine Sale",
      });
    });

    // Get today's consultation payments
    const consultationPaymentsData = await db
      .select({
        id: consultationPayments.id,
        transactionId: consultationPayments.transactionId,
        patientId: consultationPayments.patientId,
        totalAmount: consultationPayments.totalAmount,
        paymentMethod: consultationPayments.paymentMethod,
        date: consultationPayments.dateProcessed,
        processedById: consultationPayments.processedById,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
      })
      .from(consultationPayments)
      .leftJoin(
        patientProfiles,
        eq(consultationPayments.patientId, patientProfiles.id)
      )
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .where(
        and(
          gte(consultationPayments.dateProcessed, today),
          lte(consultationPayments.dateProcessed, tomorrow)
        )
      );

    consultationPaymentsData.forEach((payment) => {
      transactions.push({
        ...payment,
        type: "consultation",
        description: "Consultation Payment",
      });
    });

    // Sort by date (most recent first)
    transactions.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return res.json({
      status: true,
      result: transactions,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching today's transactions:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch today's transactions",
    });
  }
});

export default router;
