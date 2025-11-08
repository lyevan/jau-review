import { Router } from "express";
import { db } from "../db/index.js";
import { consultationServices } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/services - Get all consultation services
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { activeOnly } = req.query;

    let query = db
      .select()
      .from(consultationServices)
      .orderBy(desc(consultationServices.createdAt));

    // Filter by active status if requested
    if (activeOnly === "true") {
      query = query.where(eq(consultationServices.isActive, true)) as any;
    }

    const services = await query;

    return res.json({
      status: true,
      result: services,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching consultation services:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch consultation services",
    });
  }
});

// GET /api/services/:id - Get service by ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const serviceId = parseInt(req.params.id);

    const [service] = await db
      .select()
      .from(consultationServices)
      .where(eq(consultationServices.id, serviceId));

    if (!service) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Service not found",
      });
    }

    return res.json({
      status: true,
      result: service,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching service:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch service",
    });
  }
});

// POST /api/services - Create new consultation service (Admin only)
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin can create services
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin access required.",
      });
    }

    const { name, description, price, isActive } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Name and price are required",
      });
    }

    // Create service
    const [service] = await db
      .insert(consultationServices)
      .values({
        name,
        description,
        price: price.toString(),
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    console.log(`✅ Consultation service created: ${name}, Price: ₱${price}`);

    return res.status(201).json({
      status: true,
      result: service,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating consultation service:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create consultation service",
    });
  }
});

// PUT /api/services/:id - Update consultation service (Admin only)
router.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const serviceId = parseInt(req.params.id);

    // Only admin can update services
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin access required.",
      });
    }

    const { name, description, price, isActive } = req.body;

    // Check if service exists
    const [existingService] = await db
      .select()
      .from(consultationServices)
      .where(eq(consultationServices.id, serviceId));

    if (!existingService) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Service not found",
      });
    }

    // Update service
    const [updatedService] = await db
      .update(consultationServices)
      .set({
        name: name !== undefined ? name : existingService.name,
        description:
          description !== undefined ? description : existingService.description,
        price: price !== undefined ? price.toString() : existingService.price,
        isActive: isActive !== undefined ? isActive : existingService.isActive,
        updatedAt: new Date(),
      })
      .where(eq(consultationServices.id, serviceId))
      .returning();

    console.log(`✅ Consultation service updated: ${updatedService.name}`);

    return res.json({
      status: true,
      result: updatedService,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error updating consultation service:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to update consultation service",
    });
  }
});

// DELETE /api/services/:id - Delete consultation service (Admin only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const serviceId = parseInt(req.params.id);

    // Only admin can delete services
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin access required.",
      });
    }

    // Check if service exists
    const [existingService] = await db
      .select()
      .from(consultationServices)
      .where(eq(consultationServices.id, serviceId));

    if (!existingService) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Service not found",
      });
    }

    // Instead of deleting, deactivate the service (soft delete)
    const [deactivatedService] = await db
      .update(consultationServices)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(consultationServices.id, serviceId))
      .returning();

    console.log(
      `✅ Consultation service deactivated: ${deactivatedService.name}`
    );

    return res.json({
      status: true,
      result: deactivatedService,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error deleting consultation service:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to delete consultation service",
    });
  }
});

export default router;
