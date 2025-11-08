import { Router } from "express";
import { db } from "../db/index.js";
import {
  consultationPayments,
  appointments,
  users,
  doctorProfiles,
  patientProfiles,
} from "../db/schema.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/consultations/payments - Record consultation payment
router.post("/payments", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;

    // Only admin and staff can record payments
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const {
      appointmentId,
      consultationFee,
      tax,
      totalAmount: totalFromClient,
      amountPaid,
      cash: cashFromClient,
      change: changeFromClient,
      paymentMethod,
      discountType: discountTypeFromClient,
      discountIdNumber: discountIdFromClient,
      discountPatientName: discountNameFromClient,
    } = req.body;

    // Validate required fields
    if (!consultationFee || amountPaid === undefined) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Consultation fee and amount paid are required",
      });
    }

    // For walk-in patients, appointmentId might be undefined
    let patientId, doctorId;

    if (appointmentId) {
      // Verify appointment exists
      const [appointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId));

      if (!appointment) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Appointment not found",
        });
      }

      // Check if payment already exists for this appointment
      const [existingPayment] = await db
        .select()
        .from(consultationPayments)
        .where(eq(consultationPayments.appointmentId, appointmentId));

      if (existingPayment) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Payment already recorded for this appointment",
        });
      }

      patientId = appointment.patientId;
      doctorId = appointment.doctorId;
    } else {
      // Walk-in patient - no appointment exists
      patientId = null;
      doctorId = null;
    }

    // Calculate totals
    const taxAmount = tax || 0;
    const totalAmount =
      totalFromClient ||
      parseFloat(consultationFee.toString()) + parseFloat(taxAmount.toString());
    const paid = parseFloat(amountPaid.toString());
    const cashAmount = cashFromClient || paid;
    const changeAmount =
      changeFromClient !== undefined
        ? changeFromClient
        : cashAmount - totalAmount;

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${appointmentId || "WALKIN"}`;

    // Create payment record
    const [payment] = await db
      .insert(consultationPayments)
      .values({
        transactionId,
        appointmentId: appointmentId || null,
        patientId,
        doctorId,
        consultationFee: consultationFee.toString(),
        tax: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        amountPaid: paid.toString(),
        cash: cashAmount.toString(),
        change: changeAmount.toString(),
        paymentMethod: paymentMethod || "cash",
        discountType: discountTypeFromClient || null,
        discountIdNumber: discountIdFromClient || null,
        discountPatientName: discountNameFromClient || null,
        processedById: userId,
        dateProcessed: new Date(),
        status: "completed", // Manual entry is already completed
      })
      .returning();

    console.log(
      `✅ Consultation payment recorded: ${transactionId}, Amount: ₱${totalAmount}`
    );

    return res.status(201).json({
      status: true,
      result: payment,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error recording consultation payment:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to record consultation payment",
    });
  }
});

// GET /api/consultations/payments/pending - Get pending consultation payments
router.get(
  "/payments/pending",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;

      // Only admin and staff can view pending payments
      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      // Get all pending payments with patient and doctor details
      const pendingPayments = await db
        .select({
          id: consultationPayments.id,
          transactionId: consultationPayments.transactionId,
          appointmentId: consultationPayments.appointmentId,
          patientId: consultationPayments.patientId,
          doctorId: consultationPayments.doctorId,
          consultationFee: consultationPayments.consultationFee,
          tax: consultationPayments.tax,
          totalAmount: consultationPayments.totalAmount,
          status: consultationPayments.status,
          createdAt: consultationPayments.createdAt,
          patientFirstName: users.firstName,
          patientLastName: users.lastName,
        })
        .from(consultationPayments)
        .leftJoin(
          patientProfiles,
          eq(consultationPayments.patientId, patientProfiles.id)
        )
        .leftJoin(users, eq(patientProfiles.userId, users.id))
        .where(eq(consultationPayments.status, "pending"))
        .orderBy(desc(consultationPayments.createdAt));

      return res.json({
        status: true,
        result: pendingPayments,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching pending payments:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch pending payments",
      });
    }
  }
);

// GET /api/consultations/payments - Get consultation payments
router.get("/payments", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view payments
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const { startDate, endDate, patientId, limit } = req.query;

    // Build query
    let queryBuilder = db
      .select({
        id: consultationPayments.id,
        transactionId: consultationPayments.transactionId,
        appointmentId: consultationPayments.appointmentId,
        patientId: consultationPayments.patientId,
        doctorId: consultationPayments.doctorId,
        consultationFee: consultationPayments.consultationFee,
        tax: consultationPayments.tax,
        totalAmount: consultationPayments.totalAmount,
        amountPaid: consultationPayments.amountPaid,
        change: consultationPayments.change,
        paymentMethod: consultationPayments.paymentMethod,
        dateProcessed: consultationPayments.dateProcessed,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
      })
      .from(consultationPayments)
      .leftJoin(
        patientProfiles,
        eq(consultationPayments.patientId, patientProfiles.id)
      )
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .orderBy(desc(consultationPayments.dateProcessed));

    // Apply filters
    const conditions = [];

    // Only show completed payments (pending payments have separate endpoint)
    conditions.push(eq(consultationPayments.status, "completed"));

    if (patientId) {
      conditions.push(
        eq(consultationPayments.patientId, parseInt(patientId as string))
      );
    }

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

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any;
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit as string)) as any;
    }

    const payments = await queryBuilder;

    return res.json({
      status: true,
      result: payments,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching consultation payments:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch consultation payments",
    });
  }
});

// GET /api/consultations/payments/:id - Get payment details
router.get(
  "/payments/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;
      const paymentId = parseInt(req.params.id);

      // Only admin and staff can view payment details
      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const [payment] = await db
        .select({
          id: consultationPayments.id,
          transactionId: consultationPayments.transactionId,
          appointmentId: consultationPayments.appointmentId,
          patientId: consultationPayments.patientId,
          doctorId: consultationPayments.doctorId,
          consultationFee: consultationPayments.consultationFee,
          tax: consultationPayments.tax,
          totalAmount: consultationPayments.totalAmount,
          amountPaid: consultationPayments.amountPaid,
          change: consultationPayments.change,
          paymentMethod: consultationPayments.paymentMethod,
          dateProcessed: consultationPayments.dateProcessed,
          patientFirstName: users.firstName,
          patientLastName: users.lastName,
          patientUserId: users.id,
        })
        .from(consultationPayments)
        .leftJoin(
          patientProfiles,
          eq(consultationPayments.patientId, patientProfiles.id)
        )
        .leftJoin(users, eq(patientProfiles.userId, users.id))
        .where(eq(consultationPayments.id, paymentId));

      if (!payment) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Payment not found",
        });
      }

      return res.json({
        status: true,
        result: payment,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching payment details:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch payment details",
      });
    }
  }
);

// PUT /api/consultations/payments/:id/complete - Complete a pending payment
router.put(
  "/payments/:id/complete",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;
      const userId = req.user!.id;
      const paymentId = parseInt(req.params.id);

      // Only admin and staff can complete payments
      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const {
        amountPaid,
        cash,
        change,
        paymentMethod,
        discountType,
        discountIdNumber,
        discountPatientName,
      } = req.body;

      // Validate required fields
      if (amountPaid === undefined || !paymentMethod) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Amount paid and payment method are required",
        });
      }

      // Get the pending payment
      const [payment] = await db
        .select()
        .from(consultationPayments)
        .where(eq(consultationPayments.id, paymentId));

      if (!payment) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Payment not found",
        });
      }

      if (payment.status !== "pending") {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Payment is not in pending status",
        });
      }

      // Calculate amounts based on discount
      let totalAmount = parseFloat(payment.totalAmount.toString());
      let taxAmount = parseFloat((payment.tax || "0").toString());
      let consultationFeeAmount = parseFloat(
        (payment.consultationFee || "0").toString()
      );

      // If discount is being applied, recalculate
      if (
        discountType &&
        (discountType === "senior" || discountType === "pwd")
      ) {
        const originalSubtotal = consultationFeeAmount;
        const salesWithoutVAT = originalSubtotal / 1.12; // Remove 12% VAT
        const discount = salesWithoutVAT * 0.2; // 20% discount on VAT-exclusive amount
        totalAmount = salesWithoutVAT - discount;
        taxAmount = 0; // VAT exempt
      }

      const paid = parseFloat(amountPaid.toString());
      const cashAmount = cash || paid;
      const changeAmount =
        change !== undefined ? change : cashAmount - totalAmount;

      // Update payment to completed
      const [updatedPayment] = await db
        .update(consultationPayments)
        .set({
          status: "completed",
          totalAmount: totalAmount.toString(),
          tax: taxAmount.toString(),
          amountPaid: paid.toString(),
          cash: cashAmount.toString(),
          change: changeAmount.toString(),
          paymentMethod,
          discountType: discountType || payment.discountType,
          discountIdNumber: discountIdNumber || payment.discountIdNumber,
          discountPatientName:
            discountPatientName || payment.discountPatientName,
          processedById: userId,
          dateProcessed: new Date(),
        })
        .where(eq(consultationPayments.id, paymentId))
        .returning();

      console.log(
        `✅ Payment completed: ${payment.transactionId}, Amount: ₱${totalAmount}`
      );

      return res.json({
        status: true,
        result: updatedPayment,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error completing payment:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to complete payment",
      });
    }
  }
);

// GET /api/consultations/payments/today/summary - Get today's consultation payment summary
router.get(
  "/payments/today/summary",
  authenticateToken,
  async (req: AuthRequest, res) => {
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's payments
      const todayPayments = await db
        .select()
        .from(consultationPayments)
        .where(
          and(
            gte(consultationPayments.dateProcessed, today),
            lte(consultationPayments.dateProcessed, tomorrow)
          )
        );

      const totalPayments = todayPayments.length;
      const totalRevenue = todayPayments.reduce(
        (sum, payment) => sum + parseFloat(payment.totalAmount.toString()),
        0
      );

      return res.json({
        status: true,
        result: {
          totalPayments,
          totalRevenue,
          payments: todayPayments,
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching today's summary:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch today's summary",
      });
    }
  }
);

export default router;
