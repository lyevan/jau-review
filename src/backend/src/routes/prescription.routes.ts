import { Router } from "express";
import { db } from "../db/index.js";
import {
  prescriptions,
  prescriptionItems,
  medicines,
  visits,
  patientProfiles,
  doctorProfiles,
  users,
} from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// Create alias for doctor users
const doctorUsers = alias(users, "doctorUsers");

// POST /api/prescriptions - Create prescription (Doctor only)
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  console.log("\n========================================");
  console.log("📋 POST /api/prescriptions - Request received");
  console.log("========================================");
  console.log("User:", req.user?.email, "Role:", req.user?.role);
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;

    // Only doctors can create prescriptions
    if (userRole !== "doctor") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Doctor access required.",
      });
    }

    // Get doctor profile ID from the logged-in user
    const [doctorProfile] = await db
      .select()
      .from(doctorProfiles)
      .where(eq(doctorProfiles.userId, userId));

    if (!doctorProfile) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Doctor profile not found",
      });
    }

    const { visitId, patientId, notes, items } = req.body;

    // Validate required fields
    if (!visitId || !patientId || !items || items.length === 0) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Visit ID, patient ID, and prescription items are required",
      });
    }

    // Verify visit exists
    const [visit] = await db
      .select()
      .from(visits)
      .where(eq(visits.id, visitId));

    if (!visit) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Visit not found",
      });
    }

    // Check inventory availability for each medicine
    const itemsWithAvailability = await Promise.all(
      items.map(async (item: any) => {
        // External medicine (no medicineId, has medicineName)
        if (!item.medicineId && item.medicineName) {
          return {
            ...item,
            isExternal: true,
            isAvailable: false, // Cannot fulfill from clinic
            availableQuantity: 0,
            reason: "External medicine - purchase at any pharmacy",
          };
        }

        // Clinic inventory medicine
        if (item.medicineId) {
          const [medicine] = await db
            .select()
            .from(medicines)
            .where(eq(medicines.id, item.medicineId));

          if (!medicine) {
            return {
              ...item,
              isExternal: false,
              isAvailable: false,
              reason: "Medicine not found in inventory",
            };
          }

          const availableQuantity = medicine.stock || 0;
          const isAvailable = availableQuantity >= item.quantity;

          return {
            ...item,
            isExternal: false,
            isAvailable,
            availableQuantity,
            reason: isAvailable ? null : `Only ${availableQuantity} available`,
          };
        }

        // Invalid item (no medicineId and no medicineName)
        return {
          ...item,
          isExternal: false,
          isAvailable: false,
          reason: "Invalid item - must have medicineId or medicineName",
        };
      })
    );

    // Create prescription using doctor profile ID
    const [prescription] = await db
      .insert(prescriptions)
      .values({
        visitId,
        patientId,
        doctorId: doctorProfile.id, // Use doctor profile ID
        status: "pending",
        notes,
        createdById: userId,
      })
      .returning();

    // Create prescription items
    const createdItems = await Promise.all(
      itemsWithAvailability.map(async (item) => {
        const [prescriptionItem] = await db
          .insert(prescriptionItems)
          .values({
            prescriptionId: prescription.id,
            medicineId: item.medicineId || null, // Null for external medicines
            medicineName: item.medicineName || null, // Free-text name for external
            isExternal: item.isExternal || false,
            quantity: item.quantity,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
            isAvailable: item.isAvailable,
          })
          .returning();

        // Fetch medicine details for clinic medicines
        let medicineName = item.medicineName; // Use free-text name for external
        let medicinePrice = null;
        let medicineStock = null;

        if (item.medicineId && !item.isExternal) {
          const [medicine] = await db
            .select()
            .from(medicines)
            .where(eq(medicines.id, item.medicineId));

          if (medicine) {
            medicineName = medicine.name;
            medicinePrice = medicine.price;
            medicineStock = medicine.stock;
          }
        }

        return {
          ...prescriptionItem,
          medicineName,
          medicinePrice,
          medicineStock,
        };
      })
    );

    console.log(
      `✅ Prescription created successfully: ID ${prescription.id}, ${createdItems.length} items, Doctor Profile ID: ${doctorProfile.id}`
    );
    console.log("========================================\n");

    return res.status(201).json({
      status: true,
      result: {
        prescription,
        items: createdItems,
        availabilityCheck: itemsWithAvailability,
      },
      error: null,
    });
  } catch (error) {
    console.error("========================================");
    console.error("❌ Error creating prescription:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : error
    );
    console.error("========================================\n");
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create prescription",
    });
  }
});

// GET /api/prescriptions - Get prescriptions
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { visitId, patientId, status } = req.query;

    let queryBuilder = db
      .select({
        id: prescriptions.id,
        visitId: prescriptions.visitId,
        patientId: prescriptions.patientId,
        doctorId: prescriptions.doctorId,
        status: prescriptions.status,
        notes: prescriptions.notes,
        createdAt: prescriptions.createdAt,
        fulfilledAt: prescriptions.fulfilledAt,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        doctorFirstName: doctorUsers.firstName,
        doctorLastName: doctorUsers.lastName,
      })
      .from(prescriptions)
      .leftJoin(
        patientProfiles,
        eq(prescriptions.patientId, patientProfiles.id)
      )
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .leftJoin(doctorProfiles, eq(prescriptions.doctorId, doctorProfiles.id))
      .leftJoin(doctorUsers, eq(doctorProfiles.userId, doctorUsers.id))
      .orderBy(desc(prescriptions.createdAt));

    // Apply filters
    const conditions = [];

    if (visitId) {
      conditions.push(eq(prescriptions.visitId, parseInt(visitId as string)));
    }

    if (patientId) {
      conditions.push(
        eq(prescriptions.patientId, parseInt(patientId as string))
      );
    }

    if (status) {
      conditions.push(eq(prescriptions.status, status as any));
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any;
    }

    const prescriptionsData = await queryBuilder;

    // Fetch items for each prescription with medicine details
    const prescriptionsWithItems = await Promise.all(
      prescriptionsData.map(async (prescription) => {
        const items = await db
          .select({
            id: prescriptionItems.id,
            prescriptionId: prescriptionItems.prescriptionId,
            medicineId: prescriptionItems.medicineId,
            medicineName: prescriptionItems.medicineName, // Free-text name for external
            isExternal: prescriptionItems.isExternal,
            quantity: prescriptionItems.quantity,
            dosage: prescriptionItems.dosage,
            frequency: prescriptionItems.frequency,
            duration: prescriptionItems.duration,
            instructions: prescriptionItems.instructions,
            isAvailable: prescriptionItems.isAvailable,
            // Medicine details (only for clinic medicines)
            inventoryMedicineName: medicines.name,
            medicinePrice: medicines.price,
            medicineStock: medicines.stock,
            medicineBrandName: medicines.brandName,
            medicineGenericName: medicines.genericName,
            medicineSpecification: medicines.specification,
          })
          .from(prescriptionItems)
          .leftJoin(medicines, eq(prescriptionItems.medicineId, medicines.id))
          .where(eq(prescriptionItems.prescriptionId, prescription.id));

        // Process items to use correct medicine name with specification
        const processedItems = items.map((item) => {
          let displayName = item.isExternal
            ? item.medicineName
            : item.inventoryMedicineName || item.medicineName;

          // Add specification for inventory medicines
          if (!item.isExternal && item.medicineSpecification) {
            displayName = `${displayName} - ${item.medicineSpecification}`;
          }

          return {
            ...item,
            medicineName: displayName,
          };
        });

        return {
          ...prescription,
          items: processedItems,
        };
      })
    );

    return res.json({
      status: true,
      result: prescriptionsWithItems,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch prescriptions",
    });
  }
});

// GET /api/prescriptions/:id - Get prescription by ID with items
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const prescriptionId = parseInt(req.params.id);

    // Get prescription
    const [prescription] = await db
      .select({
        id: prescriptions.id,
        visitId: prescriptions.visitId,
        patientId: prescriptions.patientId,
        doctorId: prescriptions.doctorId,
        status: prescriptions.status,
        notes: prescriptions.notes,
        createdAt: prescriptions.createdAt,
        fulfilledAt: prescriptions.fulfilledAt,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
      })
      .from(prescriptions)
      .leftJoin(
        patientProfiles,
        eq(prescriptions.patientId, patientProfiles.id)
      )
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .where(eq(prescriptions.id, prescriptionId));

    if (!prescription) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Prescription not found",
      });
    }

    // Get prescription items with medicine details
    const items = await db
      .select({
        id: prescriptionItems.id,
        prescriptionId: prescriptionItems.prescriptionId,
        medicineId: prescriptionItems.medicineId,
        medicineName: prescriptionItems.medicineName,
        isExternal: prescriptionItems.isExternal,
        quantity: prescriptionItems.quantity,
        dosage: prescriptionItems.dosage,
        frequency: prescriptionItems.frequency,
        duration: prescriptionItems.duration,
        instructions: prescriptionItems.instructions,
        isAvailable: prescriptionItems.isAvailable,
        inventoryMedicineName: medicines.name,
        medicinePrice: medicines.price,
        medicineStock: medicines.stock,
        medicineBrandName: medicines.brandName,
        medicineGenericName: medicines.genericName,
        medicineSpecification: medicines.specification,
      })
      .from(prescriptionItems)
      .leftJoin(medicines, eq(prescriptionItems.medicineId, medicines.id))
      .where(eq(prescriptionItems.prescriptionId, prescriptionId));

    // Process items to use correct medicine name with specification
    const processedItems = items.map((item) => {
      let displayName = item.isExternal
        ? item.medicineName
        : item.inventoryMedicineName || item.medicineName;

      // Add specification for inventory medicines
      if (!item.isExternal && item.medicineSpecification) {
        displayName = `${displayName} - ${item.medicineSpecification}`;
      }

      return {
        ...item,
        medicineName: displayName,
      };
    });

    return res.json({
      status: true,
      result: {
        ...prescription,
        items: processedItems,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching prescription:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch prescription",
    });
  }
});

// PUT /api/prescriptions/:id/fulfill - Fulfill prescription (Staff/Admin only)
router.put("/:id/fulfill", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id;
    const prescriptionId = parseInt(req.params.id);

    // Only staff and admin can fulfill prescriptions
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    // Get prescription
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, prescriptionId));

    if (!prescription) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Prescription not found",
      });
    }

    if (prescription.status !== "pending") {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Prescription is not in pending status",
      });
    }

    // Get prescription items
    const items = await db
      .select()
      .from(prescriptionItems)
      .where(eq(prescriptionItems.prescriptionId, prescriptionId));

    // Check availability and update inventory
    for (const item of items) {
      // Skip external medicines - they cannot be fulfilled from clinic inventory
      if (item.isExternal) {
        console.log(
          `⏭️ Skipping external medicine: ${item.medicineName} (patient purchases elsewhere)`
        );
        continue;
      }

      if (!item.isAvailable) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Some clinic medicines are not available",
        });
      }

      // Validate medicineId exists for clinic medicines
      if (!item.medicineId) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Invalid prescription item - clinic medicine missing ID",
        });
      }

      // Get current medicine stock
      const [medicine] = await db
        .select()
        .from(medicines)
        .where(eq(medicines.id, item.medicineId));

      if (!medicine) {
        return res.status(404).json({
          status: false,
          result: null,
          error: `Medicine ${item.medicineId} not found in inventory`,
        });
      }

      const currentStock = medicine.stock || 0;
      if (currentStock < item.quantity) {
        return res.status(400).json({
          status: false,
          result: null,
          error: `Insufficient stock for ${medicine.name}. Need: ${item.quantity}, Available: ${currentStock}`,
        });
      }

      // Update inventory
      await db
        .update(medicines)
        .set({
          stock: currentStock - item.quantity,
        })
        .where(eq(medicines.id, item.medicineId));

      console.log(
        `📦 Stock updated: ${medicine.name}, -${item.quantity}, New: ${
          currentStock - item.quantity
        }`
      );
    }

    // Mark prescription as fulfilled
    const [updatedPrescription] = await db
      .update(prescriptions)
      .set({
        status: "fulfilled",
        fulfilledAt: new Date(),
        fulfilledById: userId,
      })
      .where(eq(prescriptions.id, prescriptionId))
      .returning();

    console.log(`✅ Prescription fulfilled: ID ${prescriptionId}`);

    return res.json({
      status: true,
      result: updatedPrescription,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fulfilling prescription:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fulfill prescription",
    });
  }
});

// PUT /api/prescriptions/:id/cancel - Cancel prescription
router.put("/:id/cancel", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const prescriptionId = parseInt(req.params.id);

    // Only doctor, staff, or admin can cancel
    if (userRole !== "doctor" && userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied.",
      });
    }

    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, prescriptionId));

    if (!prescription) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Prescription not found",
      });
    }

    if (prescription.status === "fulfilled") {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Cannot cancel fulfilled prescription",
      });
    }

    const [updatedPrescription] = await db
      .update(prescriptions)
      .set({
        status: "cancelled",
      })
      .where(eq(prescriptions.id, prescriptionId))
      .returning();

    console.log(`✅ Prescription cancelled: ID ${prescriptionId}`);

    return res.json({
      status: true,
      result: updatedPrescription,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error cancelling prescription:", error);
    return res.status(500).json({
      status: false,
      result: null,
      error: "Failed to cancel prescription",
    });
  }
});

export default router;
