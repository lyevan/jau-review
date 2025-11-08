import { Router } from "express";
import { db } from "../db/index.js";
import {
  medicines,
  medicineSales,
  medicineSaleItems,
  medicineBatches,
} from "../db/schema.js";
import { eq, desc, sql, and, gte, lte, asc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";

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

// POST /api/pharmacy/sales - Create new medicine sale
router.post("/sales", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;

    // Only admin and staff can create sales
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const {
      patientId,
      items,
      paymentMethod,
      notes,
      discountType,
      discountIdNumber,
      discountPatientName,
      cash,
      prescriptionId, // Optional: if provided, skip inventory reduction (prescription fulfill will handle it)
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "At least one item is required",
      });
    }

    // Validate discount info if discount is applied
    if (discountType && discountType !== "none") {
      if (!discountIdNumber || !discountPatientName) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "ID Number and Patient Name are required for discount",
        });
      }
    }

    // Calculate total and validate stock
    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const { medicineId, quantity, price } = item;

      if (!medicineId || !quantity || !price) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Missing required item fields",
        });
      }

      // Get medicine and check stock
      const [medicine] = await db
        .select()
        .from(medicines)
        .where(eq(medicines.id, medicineId));

      if (!medicine) {
        return res.status(404).json({
          status: false,
          result: null,
          error: `Medicine with ID ${medicineId} not found`,
        });
      }

      if ((medicine.stock ?? 0) < quantity) {
        return res.status(400).json({
          status: false,
          result: null,
          error: `Insufficient stock for ${medicine.name}. Available: ${
            medicine.stock ?? 0
          }, Requested: ${quantity}`,
        });
      }

      const subtotal = quantity * price;
      totalAmount += subtotal;

      saleItems.push({
        medicineId,
        medicineName: medicine.name,
        quantity,
        price,
        subtotal,
        currentStock: medicine.stock,
      });
    }

    // Calculate tax and total based on discount type
    // Prices are VAT-inclusive
    let tax = 0;
    let finalTotal = totalAmount;

    if (discountType === "senior" || discountType === "pwd") {
      // For Senior Citizen/PWD: Prices are VAT-inclusive
      // 1. Remove 12% VAT: totalAmount / 1.12
      // 2. Apply 20% discount on VAT-exclusive amount
      const salesWithoutVAT = totalAmount / 1.12;
      const discount = salesWithoutVAT * 0.2;
      finalTotal = salesWithoutVAT - discount;
      tax = 0; // VAT exempt
    } else {
      // Regular transaction - price already includes VAT
      // No additional tax to add
      finalTotal = totalAmount;
      tax = 0; // VAT is already included in the price
    }

    // Calculate change if cash is provided
    const cashAmount = cash ? parseFloat(cash) : null;
    const changeAmount = cashAmount ? cashAmount - finalTotal : null;

    // Create sale record
    const [sale] = await db
      .insert(medicineSales)
      .values({
        processedById: req.user!.id,
        subtotal: totalAmount.toString(),
        tax: tax.toString(),
        total: finalTotal.toString(),
        discountType: discountType || null,
        discountIdNumber: discountIdNumber || null,
        discountPatientName: discountPatientName || null,
        cash: cashAmount ? cashAmount.toString() : null,
        change: changeAmount ? changeAmount.toString() : null,
      })
      .returning();

    // Create sale items and update stock
    for (const item of saleItems) {
      // Update medicine stock ONLY if not from prescription
      // Prescription fulfillment will handle inventory reduction
      if (!prescriptionId) {
        // FIFO Logic: Get active batches ordered by stock_in_date (oldest first)
        const batches = await db
          .select()
          .from(medicineBatches)
          .where(
            and(
              eq(medicineBatches.medicineId, item.medicineId),
              eq(medicineBatches.status, "active"),
              sql`${medicineBatches.quantity} > 0`
            )
          )
          .orderBy(asc(medicineBatches.stockInDate));

        let remainingToRemove = item.quantity;
        const batchesUsed = [];

        // Remove from oldest batches first (FIFO)
        for (const batch of batches) {
          if (remainingToRemove <= 0) break;

          const removeFromBatch = Math.min(batch.quantity, remainingToRemove);

          // Update batch quantity
          await db
            .update(medicineBatches)
            .set({
              quantity: batch.quantity - removeFromBatch,
              updatedAt: new Date(),
            })
            .where(eq(medicineBatches.id, batch.id));

          batchesUsed.push({
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            quantityUsed: removeFromBatch,
          });

          remainingToRemove -= removeFromBatch;

          console.log(
            `📦 Batch ${batch.batchNumber}: ${batch.quantity} → ${
              batch.quantity - removeFromBatch
            } (-${removeFromBatch})`
          );
        }

        // Update total medicine stock
        const newStock = (item.currentStock ?? 0) - item.quantity;
        await db
          .update(medicines)
          .set({
            stock: newStock,
            updatedAt: new Date(),
          })
          .where(eq(medicines.id, item.medicineId));

        console.log(
          `📦 Stock updated for ${item.medicineName}: ${
            item.currentStock ?? 0
          } → ${newStock} (-${item.quantity})`
        );

        // Create sale item record for each batch used
        for (const batchUsed of batchesUsed) {
          await db.insert(medicineSaleItems).values({
            saleId: sale.id,
            medicineId: item.medicineId,
            quantity: batchUsed.quantityUsed,
            price: item.price.toString(),
            subtotal: (batchUsed.quantityUsed * item.price).toString(),
            batchId: batchUsed.batchId,
          });

          console.log(
            `   └─ Sale item: ${batchUsed.quantityUsed} units from batch ${batchUsed.batchNumber}`
          );
        }
      } else {
        // If from prescription, just create sale item without batch tracking
        await db.insert(medicineSaleItems).values({
          saleId: sale.id,
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price.toString(),
          subtotal: item.subtotal.toString(),
        });

        console.log(
          `⏭️ Skipping stock update for ${item.medicineName} - Prescription ${prescriptionId} will handle inventory`
        );
      }
    }

    // Fetch complete sale with items
    const completeSale = await db
      .select({
        id: medicineSales.id,
        processedById: medicineSales.processedById,
        subtotal: medicineSales.subtotal,
        tax: medicineSales.tax,
        total: medicineSales.total,
        createdAt: medicineSales.createdAt,
      })
      .from(medicineSales)
      .where(eq(medicineSales.id, sale.id));

    const items_with_details = await db
      .select({
        id: medicineSaleItems.id,
        medicineId: medicineSaleItems.medicineId,
        medicineName: medicines.name,
        quantity: medicineSaleItems.quantity,
        unitPrice: medicineSaleItems.price,
        subtotal: medicineSaleItems.subtotal,
      })
      .from(medicineSaleItems)
      .leftJoin(medicines, eq(medicineSaleItems.medicineId, medicines.id))
      .where(eq(medicineSaleItems.saleId, sale.id));

    console.log(
      `✅ Medicine sale created: Sale #${sale.id}, Total: ₱${totalAmount}`
    );

    res.status(201).json({
      status: true,
      result: {
        ...completeSale[0],
        items: items_with_details,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating medicine sale:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create medicine sale",
    });
  }
});

// GET /api/pharmacy/sales - Get all medicine sales
router.get("/sales", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view sales
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const { startDate, endDate, limit } = req.query;

    // Build query
    let query = db
      .select({
        id: medicineSales.id,
        processedById: medicineSales.processedById,
        subtotal: medicineSales.subtotal,
        tax: medicineSales.tax,
        total: medicineSales.total,
        createdAt: medicineSales.createdAt,
      })
      .from(medicineSales)
      .orderBy(desc(medicineSales.createdAt));

    // Apply filters
    const conditions = [];

    if (startDate) {
      conditions.push(
        sql`${medicineSales.createdAt} >= ${new Date(
          startDate as string
        ).toISOString()}`
      );
    }

    if (endDate) {
      conditions.push(
        sql`${medicineSales.createdAt} <= ${new Date(
          endDate as string
        ).toISOString()}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (limit) {
      query = query.limit(parseInt(limit as string));
    }

    const sales = await query;

    res.json({
      status: true,
      result: sales,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching medicine sales:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch medicine sales",
    });
  }
});

// GET /api/pharmacy/sales/:id - Get sale details with items
router.get("/sales/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const saleId = parseIntSafe(req.params.id, "sale ID");

    // Only admin and staff can view sale details
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    // Get sale
    const [sale] = await db
      .select({
        id: medicineSales.id,
        processedById: medicineSales.processedById,
        subtotal: medicineSales.subtotal,
        tax: medicineSales.tax,
        total: medicineSales.total,
        createdAt: medicineSales.createdAt,
      })
      .from(medicineSales)
      .where(eq(medicineSales.id, saleId));

    if (!sale) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Sale not found",
      });
    }

    // Get sale items
    const items = await db
      .select({
        id: medicineSaleItems.id,
        medicineId: medicineSaleItems.medicineId,
        medicineName: medicines.name,
        medicineCategory: medicines.category,
        quantity: medicineSaleItems.quantity,
        unitPrice: medicineSaleItems.price,
        subtotal: medicineSaleItems.subtotal,
      })
      .from(medicineSaleItems)
      .leftJoin(medicines, eq(medicineSaleItems.medicineId, medicines.id))
      .where(eq(medicineSaleItems.saleId, saleId));

    res.json({
      status: true,
      result: {
        ...sale,
        items,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching sale details:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch sale details",
    });
  }
});

// GET /api/pharmacy/sales/today/summary - Get today's sales summary
router.get(
  "/sales/today/summary",
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

      // Get today's sales
      const todaySales = await db
        .select()
        .from(medicineSales)
        .where(
          sql`${medicineSales.createdAt} >= ${today.toISOString()} AND ${
            medicineSales.createdAt
          } < ${tomorrow.toISOString()}`
        );

      const totalSales = todaySales.length;
      const totalRevenue = todaySales.reduce(
        (sum, sale) => sum + parseFloat(sale.total.toString()),
        0
      );

      res.json({
        status: true,
        result: {
          totalSales,
          totalRevenue,
          sales: todaySales,
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching today's summary:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch today's summary",
      });
    }
  }
);

export default router;
