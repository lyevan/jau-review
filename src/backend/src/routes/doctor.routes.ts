import { Router } from "express";
import { db } from "../db/index.js";
import {
  doctorProfiles,
  doctorSchedules,
  users,
  appointments,
} from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/doctors/profile/user/:userId - Get doctor profile by user ID
router.get("/profile/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const [doctor] = await db
      .select({
        id: doctorProfiles.id,
        userId: doctorProfiles.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        specialization: doctorProfiles.specialization,
        licenseNumber: doctorProfiles.licenseNumber,
        yearsExperience: doctorProfiles.yearsExperience,
        medicalSchool: doctorProfiles.medicalSchool,
        biography: doctorProfiles.biography,
        status: doctorProfiles.status,
      })
      .from(doctorProfiles)
      .leftJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(doctorProfiles.userId, userId));

    if (!doctor) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Doctor profile not found for this user",
      });
    }

    res.json({
      status: true,
      result: doctor,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching doctor profile by user ID:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch doctor profile",
    });
  }
});

// GET /api/doctors - List all doctors
router.get("/", async (_req, res) => {
  try {
    const doctorsList = await db
      .select({
        id: doctorProfiles.id,
        userId: doctorProfiles.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        specialization: doctorProfiles.specialization,
        licenseNumber: doctorProfiles.licenseNumber,
        yearsExperience: doctorProfiles.yearsExperience,
        medicalSchool: doctorProfiles.medicalSchool,
        biography: doctorProfiles.biography,
        status: doctorProfiles.status,
      })
      .from(doctorProfiles)
      .leftJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(doctorProfiles.status, "active"));

    console.log(`✅ Found ${doctorsList.length} doctors`);

    res.json({
      status: true,
      result: doctorsList,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching doctors:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch doctors",
    });
  }
});

// GET /api/doctors/:id - Get single doctor
router.get("/:id", async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);

    const [doctor] = await db
      .select({
        id: doctorProfiles.id,
        userId: doctorProfiles.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        specialization: doctorProfiles.specialization,
        licenseNumber: doctorProfiles.licenseNumber,
        yearsExperience: doctorProfiles.yearsExperience,
        medicalSchool: doctorProfiles.medicalSchool,
        biography: doctorProfiles.biography,
        status: doctorProfiles.status,
      })
      .from(doctorProfiles)
      .leftJoin(users, eq(doctorProfiles.userId, users.id))
      .where(eq(doctorProfiles.id, doctorId));

    if (!doctor) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Doctor not found",
      });
    }

    res.json({
      status: true,
      result: doctor,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching doctor:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch doctor",
    });
  }
});

// GET /api/doctors/:id/schedule - Get doctor's schedule
router.get("/:id/schedule", async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);

    const schedule = await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.doctorId, doctorId));

    res.json({
      status: true,
      result: schedule,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching doctor schedule:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch doctor schedule",
    });
  }
});

// GET /api/doctors/:id/appointments - Get doctor's appointments for a specific date
router.get("/:id/appointments", async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const { date } = req.query;

    console.log(`📅 Fetching appointments for doctor ${doctorId} on ${date}`);

    if (!date) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Date parameter is required",
      });
    }

    const doctorAppointments = await db
      .select({
        id: appointments.id,
        date: appointments.date,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        patientId: appointments.patientId,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date as string)
        )
      );

    console.log(`✅ Found ${doctorAppointments.length} appointments`);

    res.json({
      status: true,
      result: doctorAppointments,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching doctor appointments:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch doctor appointments",
    });
  }
});

// POST /api/doctors - Create new doctor
router.post("/", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      specialization,
      licenseNumber,
      yearsExperience,
      medicalSchool,
      biography,
      contactNumber,
    } = req.body;

    console.log("📝 Creating doctor:", email);

    // Validation
    if (!email || !password || !firstName || !lastName || !specialization) {
      return res.status(400).json({
        status: false,
        result: null,
        error:
          "Email, password, first name, last name, and specialization are required",
      });
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Email already registered",
      });
    }

    // Generate username from email
    const username = email.split("@")[0];

    // Hash password
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Create user account
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        contactNumber: contactNumber || null,
        role: "doctor",
        isActive: true,
      })
      .returning();

    console.log("✅ User created:", newUser.id);

    // Create doctor profile
    const [newDoctor] = await db
      .insert(doctorProfiles)
      .values({
        userId: newUser.id,
        specialization,
        licenseNumber: licenseNumber || null,
        yearsExperience: yearsExperience || 0,
        medicalSchool: medicalSchool || null,
        biography: biography || null,
        status: "active",
      })
      .returning();

    console.log("✅ Doctor profile created:", newDoctor.id);

    res.status(201).json({
      status: true,
      result: {
        message: "Doctor created successfully",
        doctor: {
          id: newDoctor.id,
          userId: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          specialization: newDoctor.specialization,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating doctor:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create doctor",
    });
  }
});

// POST /api/doctors/:id/schedule - Create/Update doctor's schedule
router.post("/:id/schedule", async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const { day, startTime, endTime } = req.body;

    // Validate input
    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Missing required fields: day, startTime, endTime",
      });
    }

    // Validate day
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        status: false,
        result: null,
        error:
          "Invalid day. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
      });
    }

    // Validate time format and logic
    if (startTime >= endTime) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Start time must be before end time",
      });
    }

    // Check for overlapping schedules on the same day
    const existingSchedules = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.doctorId, doctorId),
          eq(doctorSchedules.day, day)
        )
      );

    // Check for time overlap
    for (const existing of existingSchedules) {
      const hasOverlap =
        (startTime >= existing.startTime && startTime < existing.endTime) ||
        (endTime > existing.startTime && endTime <= existing.endTime) ||
        (startTime <= existing.startTime && endTime >= existing.endTime);

      if (hasOverlap) {
        return res.status(400).json({
          status: false,
          result: null,
          error: `Schedule overlaps with existing time block: ${existing.startTime} - ${existing.endTime}`,
        });
      }
    }

    // Create new schedule
    const [newSchedule] = await db
      .insert(doctorSchedules)
      .values({
        doctorId,
        day: day as
          | "monday"
          | "tuesday"
          | "wednesday"
          | "thursday"
          | "friday"
          | "saturday"
          | "sunday",
        startTime,
        endTime,
      })
      .returning();

    res.json({
      status: true,
      result: newSchedule,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating/updating schedule:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create/update schedule",
    });
  }
});

// PUT /api/doctors/:id/schedule/:scheduleId - Update a specific schedule entry
router.put("/:id/schedule/:scheduleId", async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const scheduleId = parseInt(req.params.scheduleId);
    const { day, startTime, endTime } = req.body;

    // Validate input
    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Missing required fields: day, startTime, endTime",
      });
    }

    // Validate time format and logic
    if (startTime >= endTime) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Start time must be before end time",
      });
    }

    // Check for overlapping schedules (excluding the current one being updated)
    const existingSchedules = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.doctorId, doctorId),
          eq(doctorSchedules.day, day)
        )
      );

    // Check for time overlap with other schedules
    for (const existing of existingSchedules) {
      if (existing.id === scheduleId) continue; // Skip the schedule being updated

      const hasOverlap =
        (startTime >= existing.startTime && startTime < existing.endTime) ||
        (endTime > existing.startTime && endTime <= existing.endTime) ||
        (startTime <= existing.startTime && endTime >= existing.endTime);

      if (hasOverlap) {
        return res.status(400).json({
          status: false,
          result: null,
          error: `Schedule overlaps with existing time block: ${existing.startTime} - ${existing.endTime}`,
        });
      }
    }

    // Update the schedule
    const [updated] = await db
      .update(doctorSchedules)
      .set({
        day: day as
          | "monday"
          | "tuesday"
          | "wednesday"
          | "thursday"
          | "friday"
          | "saturday"
          | "sunday",
        startTime,
        endTime,
      })
      .where(eq(doctorSchedules.id, scheduleId))
      .returning();

    res.json({
      status: true,
      result: updated,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error updating schedule:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to update schedule",
    });
  }
});

// DELETE /api/doctors/:id/schedule/:scheduleId - Delete a schedule entry
router.delete("/:id/schedule/:scheduleId", async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);

    await db.delete(doctorSchedules).where(eq(doctorSchedules.id, scheduleId));

    res.json({
      status: true,
      result: { message: "Schedule deleted successfully" },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error deleting schedule:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to delete schedule",
    });
  }
});

export default router;
