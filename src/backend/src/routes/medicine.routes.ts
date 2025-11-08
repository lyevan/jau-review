import { Router } from "express";
import { db } from "../db/index.js";
import { medicines, medicineBatches } from "../db/schema.js";
import { eq, or, ilike, sql, desc, and, asc } from "drizzle-orm";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// Helper function to safely parse integer IDs
function parseIntSafe(
  value: string | undefined,
  fieldName: string = "ID"
): number {
  const parsed = parseInt(value || "");
  if (isNaN(parsed)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }
  return parsed;
}

// GET /api/medicines - Get all medicines
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { search, lowStock } = req.query;

    // Build query
    let query = db.select().from(medicines).orderBy(desc(medicines.name));

    // Apply filters
    const conditions = [];

    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(medicines.name, `%${search}%`),
          ilike(medicines.brandName, `%${search}%`),
          ilike(medicines.genericName, `%${search}%`),
          ilike(medicines.description, `%${search}%`)
        )!
      );
    }

    if (lowStock === "true") {
      conditions.push(sql`${medicines.stock} <= ${medicines.minStock}`);
    }

    if (conditions.length > 0) {
      query = query.where(sql`${sql.join(conditions, sql` AND `)}`);
    }

    const allMedicines = await query;

    res.json({
      status: true,
      result: allMedicines,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching medicines:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch medicines",
    });
  }
});

// GET /api/medicines/expiring-batches - Get expiring batches alert
router.get(
  "/expiring-batches",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const expiringBatches = await db
        .select({
          batch_id: medicineBatches.id,
          medicine_name: medicines.name,
          batch_number: medicineBatches.batchNumber,
          quantity: medicineBatches.quantity,
          expiry_date: medicineBatches.expiryDate,
          supplier: medicineBatches.supplier,
        })
        .from(medicineBatches)
        .innerJoin(medicines, eq(medicineBatches.medicineId, medicines.id))
        .where(
          and(
            eq(medicineBatches.status, "active"),
            sql`${medicineBatches.quantity} > 0`,
            sql`${medicineBatches.expiryDate} IS NOT NULL`,
            sql`${
              medicineBatches.expiryDate
            } <= CURRENT_DATE + INTERVAL '${sql.raw(days.toString())} days'`,
            sql`${medicineBatches.expiryDate} >= CURRENT_DATE`
          )
        )
        .orderBy(asc(medicineBatches.expiryDate));

      // Calculate days until expiry
      const batchesWithDays = expiringBatches.map((batch) => ({
        ...batch,
        days_until_expiry: batch.expiry_date
          ? Math.floor(
              (new Date(batch.expiry_date).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      }));

      res.json({
        status: true,
        result: batchesWithDays,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching expiring batches:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch expiring batches",
      });
    }
  }
);

// GET /api/medicines/:id - Get medicine by ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const medicineId = parseIntSafe(req.params.id, "medicine ID");

    const [medicine] = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, medicineId));

    if (!medicine) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Medicine not found",
      });
    }

    res.json({
      status: true,
      result: medicine,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching medicine:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch medicine";
    res
      .status(
        error instanceof Error && error.message.includes("Invalid") ? 400 : 500
      )
      .json({
        status: false,
        result: null,
        error: errorMessage,
      });
  }
});

// POST /api/medicines - Create new medicine (Admin/Staff only)
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can create medicines
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const {
      name,
      description,
      brandName,
      genericName,
      price,
      stock,
      minStock,
      unit,
      expirationDate,
    } = req.body;

    // Validate required fields
    if (
      !brandName ||
      !genericName ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Missing required fields",
      });
    }

    // Auto-generate name from brand and generic if not provided
    const medicineName = name || `${brandName} (${genericName})`;

    // Create medicine
    const [newMedicine] = await db
      .insert(medicines)
      .values({
        name: medicineName,
        description: description || null,
        brandName,
        genericName,
        price,
        stock,
        minStock: minStock || 10,
        unit: unit || "pcs",
        expirationDate: expirationDate || null,
      })
      .returning();

    res.status(201).json({
      status: true,
      result: newMedicine,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating medicine:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create medicine",
    });
  }
});

// PATCH /api/medicines/:id - Update medicine (Admin/Staff only)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const medicineId = parseIntSafe(req.params.id, "medicine ID");

    // Only admin and staff can update medicines
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const updateData = req.body;

    // Check if medicine exists
    const [medicine] = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, medicineId));

    if (!medicine) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Medicine not found",
      });
    }

    // Update medicine
    const [updatedMedicine] = await db
      .update(medicines)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(medicines.id, medicineId))
      .returning();

    res.json({
      status: true,
      result: updatedMedicine,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error updating medicine:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to update medicine",
    });
  }
});

// POST /api/medicines/:id/adjust-stock - Adjust medicine stock (Admin/Staff only)
router.post(
  "/:id/adjust-stock",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;
      const medicineId = parseIntSafe(req.params.id, "medicine ID");

      // Only admin and staff can adjust stock
      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const { adjustment, reason } = req.body;

      if (adjustment === undefined) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Adjustment amount is required",
        });
      }

      // Get current medicine
      const [medicine] = await db
        .select()
        .from(medicines)
        .where(eq(medicines.id, medicineId));

      if (!medicine) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Medicine not found",
        });
      }

      const newStock = medicine.stock + adjustment;

      if (newStock < 0) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Insufficient stock",
        });
      }

      // Update stock
      const [updatedMedicine] = await db
        .update(medicines)
        .set({
          stock: newStock,
          updatedAt: new Date(),
        })
        .where(eq(medicines.id, medicineId))
        .returning();

      console.log(
        `📦 Stock adjusted for ${medicine.name}: ${
          medicine.stock
        } → ${newStock} (${adjustment > 0 ? "+" : ""}${adjustment})`
      );
      if (reason) console.log(`   Reason: ${reason}`);

      res.json({
        status: true,
        result: updatedMedicine,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error adjusting stock:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to adjust stock",
      });
    }
  }
);

// GET /api/medicines/low-stock/alerts - Get low stock alerts
router.get(
  "/low-stock/alerts",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const lowStockMedicines = await db
        .select()
        .from(medicines)
        .where(sql`${medicines.stock} <= ${medicines.minStock}`)
        .orderBy(medicines.stock);

      res.json({
        status: true,
        result: lowStockMedicines,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching low stock alerts:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch low stock alerts",
      });
    }
  }
);

// DELETE /api/medicines/:id - Delete medicine (Admin only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const medicineId = parseIntSafe(req.params.id, "medicine ID");

    // Only admin can delete medicines
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin access required.",
      });
    }

    // Check if medicine exists
    const [medicine] = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, medicineId));

    if (!medicine) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Medicine not found",
      });
    }

    await db.delete(medicines).where(eq(medicines.id, medicineId));

    res.json({
      status: true,
      result: { message: "Medicine deleted successfully" },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error deleting medicine:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to delete medicine",
    });
  }
});

// ============================================================================
// BATCH MANAGEMENT ROUTES
// ============================================================================

// GET /api/medicines/:id/batches - Get all batches for a medicine
router.get("/:id/batches", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const medicineId = parseIntSafe(req.params.id, "medicine ID");

    const batches = await db
      .select()
      .from(medicineBatches)
      .where(eq(medicineBatches.medicineId, medicineId))
      .orderBy(asc(medicineBatches.stockInDate)); // FIFO order

    res.json({
      status: true,
      result: batches,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching batches:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch batches",
    });
  }
});

// POST /api/medicines/stock-in - Stock in new batch (Admin/Staff only)
router.post("/stock-in", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can stock in
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const {
      medicineId,
      batchNumber,
      quantity,
      expiryDate,
      manufactureDate,
      supplier,
      costPrice,
      notes,
    } = req.body;

    // Validate required fields
    if (!medicineId || !batchNumber || !quantity || quantity <= 0) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Missing or invalid required fields",
      });
    }

    // Check if medicine exists
    const [medicine] = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, medicineId));

    if (!medicine) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Medicine not found",
      });
    }

    // Create new batch
    const [newBatch] = await db
      .insert(medicineBatches)
      .values({
        medicineId,
        batchNumber,
        quantity,
        originalQuantity: quantity,
        expiryDate: expiryDate || null,
        manufactureDate: manufactureDate || null,
        supplier: supplier || null,
        costPrice: costPrice || null,
        notes: notes || null,
        status: "active",
        createdById: req.user!.id,
      })
      .returning();

    // Update total stock in medicines table
    await db
      .update(medicines)
      .set({
        stock: sql`${medicines.stock} + ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(medicines.id, medicineId));

    res.status(201).json({
      status: true,
      result: newBatch,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error stocking in medicine:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to stock in medicine",
    });
  }
});

// POST /api/medicines/stock-out - Stock out medicine using FIFO (Admin/Staff only)
router.post("/stock-out", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can stock out
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const { medicineId, quantity, reason, notes } = req.body;

    // Validate required fields
    if (!medicineId || !quantity || quantity <= 0 || !reason || !notes) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Missing or invalid required fields",
      });
    }

    // Check if medicine exists
    const [medicine] = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, medicineId));

    if (!medicine) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Medicine not found",
      });
    }

    // Check if sufficient stock
    if ((medicine.stock ?? 0) < quantity) {
      return res.status(400).json({
        status: false,
        result: null,
        error: `Insufficient stock. Available: ${
          medicine.stock ?? 0
        }, Requested: ${quantity}`,
      });
    }

    // Get active batches ordered by FIFO (oldest first)
    const batches = await db
      .select()
      .from(medicineBatches)
      .where(
        and(
          eq(medicineBatches.medicineId, medicineId),
          eq(medicineBatches.status, "active"),
          sql`${medicineBatches.quantity} > 0`
        )
      )
      .orderBy(asc(medicineBatches.stockInDate));

    if (batches.length === 0) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "No active batches available",
      });
    }

    // FIFO logic: Remove from oldest batches first
    let remainingToRemove = quantity;
    const updatedBatches = [];

    for (const batch of batches) {
      if (remainingToRemove <= 0) break;

      const removeFromBatch = Math.min(batch.quantity, remainingToRemove);

      // Update batch quantity
      const [updatedBatch] = await db
        .update(medicineBatches)
        .set({
          quantity: batch.quantity - removeFromBatch,
          updatedAt: new Date(),
        })
        .where(eq(medicineBatches.id, batch.id))
        .returning();

      updatedBatches.push(updatedBatch);
      remainingToRemove -= removeFromBatch;
    }

    // Update total stock in medicines table
    await db
      .update(medicines)
      .set({
        stock: sql`${medicines.stock} - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(medicines.id, medicineId));

    res.json({
      status: true,
      result: {
        message: `Successfully removed ${quantity} units using FIFO`,
        reason,
        notes,
        affectedBatches: updatedBatches,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error stocking out medicine:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to stock out medicine",
    });
  }
});

// PATCH /api/medicines/batches/:id/status - Update batch status (mark as expired/damaged)
router.patch(
  "/batches/:id/status",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;
      const batchId = parseIntSafe(req.params.id, "batch ID");

      // Only admin and staff can update batch status
      if (userRole !== "admin" && userRole !== "staff") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied. Admin or staff access required.",
        });
      }

      const { status, notes } = req.body;

      // Validate status
      if (!["active", "expired", "damaged"].includes(status)) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Invalid status. Must be: active, expired, or damaged",
        });
      }

      // Check if batch exists
      const [batch] = await db
        .select()
        .from(medicineBatches)
        .where(eq(medicineBatches.id, batchId));

      if (!batch) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Batch not found",
        });
      }

      // Update batch status
      const [updatedBatch] = await db
        .update(medicineBatches)
        .set({
          status,
          notes: notes || batch.notes,
          updatedAt: new Date(),
        })
        .where(eq(medicineBatches.id, batchId))
        .returning();

      res.json({
        status: true,
        result: updatedBatch,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error updating batch status:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to update batch status",
      });
    }
  }
);

export default router;
