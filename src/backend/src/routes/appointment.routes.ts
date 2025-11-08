import { Router } from "express";
import { db } from "../db/index.js";
import {
  appointments,
  users,
  patientProfiles,
  doctorProfiles,
  patientMedicalRecords,
  visits,
} from "../db/schema.js";
import { eq, and, ne, or, gte, lte, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/appointments - List user's appointments
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log(
      "📅 Fetching appointments for user:",
      userId,
      "| Role:",
      userRole
    );

    let userAppointments;

    if (userRole === "patient") {
      // Get patient's profile ID first
      const [patientProfile] = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId));

      if (!patientProfile) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Patient profile not found",
        });
      }

      // Fetch patient's appointments with doctor details
      userAppointments = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          status: appointments.status,
          reason: appointments.reason,
          rescheduleReason: appointments.rescheduleReason,
          conflictingAppointmentId: appointments.conflictingAppointmentId,
          priority: appointments.priority,
          proposedDate: appointments.proposedDate,
          proposedStartTime: appointments.proposedStartTime,
          cancellationReason: appointments.cancellationReason,
          createdAt: appointments.createdAt,
          doctor: {
            id: doctorProfiles.id,
            firstName: users.firstName,
            lastName: users.lastName,
            specialization: doctorProfiles.specialization,
          },
        })
        .from(appointments)
        .leftJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
        .leftJoin(users, eq(doctorProfiles.userId, users.id))
        .where(eq(appointments.patientId, patientProfile.id))
        .orderBy(desc(appointments.date));
    } else if (userRole === "doctor") {
      // Get doctor's profile ID first
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

      // Fetch doctor's appointments with patient details
      userAppointments = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          status: appointments.status,
          reason: appointments.reason,
          rescheduleReason: appointments.rescheduleReason,
          conflictingAppointmentId: appointments.conflictingAppointmentId,
          priority: appointments.priority,
          proposedDate: appointments.proposedDate,
          proposedStartTime: appointments.proposedStartTime,
          cancellationReason: appointments.cancellationReason,
          createdAt: appointments.createdAt,
          patient: {
            id: patientProfiles.id,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(appointments)
        .leftJoin(
          patientProfiles,
          eq(appointments.patientId, patientProfiles.id)
        )
        .leftJoin(users, eq(patientProfiles.userId, users.id))
        .where(eq(appointments.doctorId, doctorProfile.id))
        .orderBy(desc(appointments.date));
    } else {
      // Admin/Staff - get all appointments with both patient and doctor details
      // Create table aliases for doctor and patient users
      const doctorUser = alias(users, "doctor_user");
      const patientUser = alias(users, "patient_user");

      userAppointments = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          status: appointments.status,
          reason: appointments.reason,
          rescheduleReason: appointments.rescheduleReason,
          conflictingAppointmentId: appointments.conflictingAppointmentId,
          priority: appointments.priority,
          proposedDate: appointments.proposedDate,
          proposedStartTime: appointments.proposedStartTime,
          cancellationReason: appointments.cancellationReason,
          createdAt: appointments.createdAt,
          doctorId: doctorProfiles.id,
          doctorFirstName: doctorUser.firstName,
          doctorLastName: doctorUser.lastName,
          doctorSpecialization: doctorProfiles.specialization,
          patientId: patientProfiles.id,
          patientFirstName: patientUser.firstName,
          patientLastName: patientUser.lastName,
        })
        .from(appointments)
        .leftJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
        .leftJoin(doctorUser, eq(doctorProfiles.userId, doctorUser.id))
        .leftJoin(
          patientProfiles,
          eq(appointments.patientId, patientProfiles.id)
        )
        .leftJoin(patientUser, eq(patientProfiles.userId, patientUser.id))
        .orderBy(desc(appointments.date));

      // Transform to match expected structure
      userAppointments = userAppointments.map((apt: any) => ({
        id: apt.id,
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        reason: apt.reason,
        rescheduleReason: apt.rescheduleReason,
        conflictingAppointmentId: apt.conflictingAppointmentId,
        priority: apt.priority,
        proposedDate: apt.proposedDate,
        proposedStartTime: apt.proposedStartTime,
        cancellationReason: apt.cancellationReason,
        createdAt: apt.createdAt,
        doctor: apt.doctorId
          ? {
              id: apt.doctorId,
              firstName: apt.doctorFirstName,
              lastName: apt.doctorLastName,
              specialization: apt.doctorSpecialization,
            }
          : null,
        patient: apt.patientId
          ? {
              id: apt.patientId,
              firstName: apt.patientFirstName,
              lastName: apt.patientLastName,
            }
          : null,
      }));
    }

    console.log(`✅ Found ${userAppointments.length} appointments`);

    res.json({
      status: true,
      result: userAppointments,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch appointments",
    });
  }
});

// GET /api/appointments/conflicts - Get appointments with time conflicts (for doctors)
router.get("/conflicts", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only doctors can view conflicts
    if (userRole !== "doctor") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Only doctors can view conflicting appointments",
      });
    }

    // Get doctor profile
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

    // Get all pending appointments for this doctor
    const allAppointments = await db
      .select({
        id: appointments.id,
        date: appointments.date,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        reason: appointments.reason,
        priority: appointments.priority,
        createdAt: appointments.createdAt,
        patient: {
          id: patientProfiles.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(appointments)
      .leftJoin(patientProfiles, eq(appointments.patientId, patientProfiles.id))
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .where(
        and(
          eq(appointments.doctorId, doctorProfile.id),
          ne(appointments.status, "cancelled"),
          ne(appointments.status, "completed")
        )
      )
      .orderBy(
        appointments.date,
        appointments.startTime,
        appointments.priority
      );

    // Group by date and time to find conflicts
    const slotMap = new Map<string, typeof allAppointments>();
    for (const apt of allAppointments) {
      const key = `${apt.date}_${apt.startTime}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, []);
      }
      slotMap.get(key)!.push(apt);
    }

    // Filter only slots with multiple appointments
    const conflicts = [];
    for (const [key, appointmentsInSlot] of slotMap.entries()) {
      if (appointmentsInSlot.length > 1) {
        conflicts.push({
          date: appointmentsInSlot[0].date,
          startTime: appointmentsInSlot[0].startTime,
          count: appointmentsInSlot.length,
          appointments: appointmentsInSlot,
          firstRequester: appointmentsInSlot[0],
        });
      }
    }

    console.log(`✅ Found ${conflicts.length} conflicting time slots`);

    res.json({
      status: true,
      result: conflicts,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching conflicts:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch conflicts",
    });
  }
});

// POST /api/appointments - Create new appointment
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { doctorId, date, startTime, endTime, reason } = req.body;

    // Validate required fields
    if (!doctorId || !date || !startTime) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Doctor ID, date, and start time are required",
      });
    }

    // Only patients can create appointments
    if (userRole !== "patient") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Only patients can create appointments",
      });
    }

    // Get patient profile
    const [patientProfile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, userId));

    if (!patientProfile) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Patient profile not found",
      });
    }

    // Check for existing appointments at the same time
    const conflictingAppointments = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        status: appointments.status,
        createdAt: appointments.createdAt,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
      })
      .from(appointments)
      .leftJoin(patientProfiles, eq(appointments.patientId, patientProfiles.id))
      .leftJoin(users, eq(patientProfiles.userId, users.id))
      .where(
        and(
          eq(appointments.doctorId, parseInt(doctorId)),
          eq(appointments.date, date),
          eq(appointments.startTime, startTime),
          ne(appointments.status, "cancelled")
        )
      )
      .orderBy(appointments.createdAt);

    let newAppointment;
    let priority = 0;

    if (conflictingAppointments.length > 0) {
      // There's a conflict - set priority based on order
      priority = conflictingAppointments.length + 1;

      console.log(
        `⚠️  Conflict detected! ${conflictingAppointments.length} existing appointment(s) at this time`
      );

      // Create appointment with "pending" status (will need doctor to resolve conflict)
      [newAppointment] = await db
        .insert(appointments)
        .values({
          patientId: patientProfile.id,
          doctorId: parseInt(doctorId),
          date: date,
          startTime,
          endTime: endTime || startTime,
          status: "pending",
          reason: reason || null,
          priority: priority,
        })
        .returning();

      console.log(
        `✅ Appointment created with priority ${priority} (conflict exists)`
      );

      // Return conflict information
      return res.status(201).json({
        status: true,
        result: {
          ...newAppointment,
          hasConflict: true,
          conflictingAppointments: conflictingAppointments.map((a) => ({
            id: a.id,
            patientName: `${a.patientFirstName} ${a.patientLastName}`,
            createdAt: a.createdAt,
            status: a.status,
          })),
          message:
            "Your appointment request has been submitted. The doctor will need to review conflicting appointments.",
        },
        error: null,
      });
    }

    // No conflict - create appointment normally
    [newAppointment] = await db
      .insert(appointments)
      .values({
        patientId: patientProfile.id,
        doctorId: parseInt(doctorId),
        date: date,
        startTime,
        endTime: endTime || startTime,
        status: "pending",
        reason: reason || null,
        priority: 1, // First appointment for this slot
      })
      .returning();

    console.log("✅ Appointment created:", newAppointment.id);

    res.status(201).json({
      status: true,
      result: {
        ...newAppointment,
        hasConflict: false,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create appointment",
    });
  }
});

// POST /api/appointments/:id/request-reschedule - Doctor requests patient to reschedule
router.post(
  "/:id/request-reschedule",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const appointmentId = parseInt(req.params.id);
      const { reason, proposedDate, proposedStartTime } = req.body;

      // Validate required fields
      if (!reason || !proposedDate || !proposedStartTime) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Reason, proposed date, and proposed start time are required",
        });
      }

      // Only doctors can request reschedule
      if (userRole !== "doctor") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Only doctors can request reschedule",
        });
      }

      // Get doctor profile
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

      // Get the appointment
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

      // Verify it's the doctor's appointment
      if (appointment.doctorId !== doctorProfile.id) {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Unauthorized",
        });
      }

      // Update appointment to reschedule_requested status with proposed time
      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          status: "reschedule_requested",
          rescheduleReason: reason,
          proposedDate: proposedDate,
          proposedStartTime: proposedStartTime,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, appointmentId))
        .returning();

      console.log(`✅ Reschedule requested for appointment ${appointmentId}`);

      res.json({
        status: true,
        result: updatedAppointment,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error requesting reschedule:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to request reschedule",
      });
    }
  }
);

// POST /api/appointments/:id/confirm-reschedule - Patient confirms reschedule
router.post(
  "/:id/confirm-reschedule",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const appointmentId = parseInt(req.params.id);

      // Only patients can confirm reschedule
      if (userRole !== "patient") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Only patients can confirm reschedule",
        });
      }

      // Get patient profile
      const [patientProfile] = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId));

      if (!patientProfile) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Patient profile not found",
        });
      }

      // Get the appointment
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

      // Verify it's the patient's appointment
      if (appointment.patientId !== patientProfile.id) {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Unauthorized",
        });
      }

      // Verify appointment is in reschedule_requested status
      if (appointment.status !== "reschedule_requested") {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Appointment is not pending reschedule",
        });
      }

      // Verify proposed date and time exist
      if (!appointment.proposedDate || !appointment.proposedStartTime) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "No proposed reschedule time found",
        });
      }

      // Update appointment with new date/time and set status to confirmed
      const [updatedAppointment] = await db
        .update(appointments)
        .set({
          date: appointment.proposedDate,
          startTime: appointment.proposedStartTime,
          endTime: appointment.proposedStartTime, // Same as start time for now
          status: "confirmed",
          proposedDate: null, // Clear proposed fields
          proposedStartTime: null,
          rescheduleReason: null,
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, appointmentId))
        .returning();

      console.log(
        `✅ Patient confirmed reschedule for appointment ${appointmentId}`
      );

      res.json({
        status: true,
        result: updatedAppointment,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error confirming reschedule:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to confirm reschedule",
      });
    }
  }
);

// PATCH /api/appointments/:id - Update appointment
router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const appointmentId = parseInt(req.params.id);
    const updateData = req.body;

    // Get the appointment
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

    // Check authorization
    if (userRole === "patient") {
      const [patientProfile] = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId));

      if (!patientProfile || appointment.patientId !== patientProfile.id) {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Not authorized to update this appointment",
        });
      }
    } else if (userRole === "doctor") {
      const [doctorProfile] = await db
        .select()
        .from(doctorProfiles)
        .where(eq(doctorProfiles.userId, userId));

      if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Not authorized to update this appointment",
        });
      }
    }
    // Admin/Staff can update any appointment

    // If trying to set status to 'confirmed', check for conflicts
    if (updateData.status === "confirmed") {
      // Check if this appointment has a priority > 1 (meaning it's in conflict)
      if (appointment.priority && appointment.priority > 1) {
        return res.status(400).json({
          status: false,
          result: null,
          error:
            "Cannot confirm appointment with scheduling conflicts. Please request reschedule instead.",
        });
      }

      // Check if there's already another confirmed appointment at the same time slot
      const conflictingAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.doctorId, appointment.doctorId),
            eq(appointments.date, appointment.date),
            eq(appointments.startTime, appointment.startTime),
            eq(appointments.status, "confirmed"),
            ne(appointments.id, appointmentId) // Exclude current appointment
          )
        );

      if (conflictingAppointments.length > 0) {
        return res.status(400).json({
          status: false,
          result: null,
          error:
            "Cannot confirm - another appointment is already confirmed for this time slot.",
        });
      }
    }

    // Update appointment
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    // If appointment is marked as completed, create a visit record
    if (
      updateData.status === "completed" &&
      appointment.status !== "completed"
    ) {
      try {
        // Get patient profile to find the user ID
        const [patientProfile] = await db
          .select()
          .from(patientProfiles)
          .where(eq(patientProfiles.id, appointment.patientId));

        if (!patientProfile) {
          console.warn("⚠️ Patient profile not found:", appointment.patientId);
          return;
        }

        const patientUserId = patientProfile.userId;

        // Get patient's medical record (linked to user ID, not profile ID)
        let [medicalRecord] = await db
          .select()
          .from(patientMedicalRecords)
          .where(eq(patientMedicalRecords.patientId, patientUserId));

        // If no medical record exists, create one automatically
        if (!medicalRecord) {
          console.log(
            `📝 Auto-creating medical record for patient user ${patientUserId}`
          );

          // Get patient data
          const [patient] = await db
            .select()
            .from(users)
            .where(eq(users.id, patientUserId));

          if (patient) {
            // Calculate age
            const calculateAge = (birthDate: string): number => {
              const today = new Date();
              const birth = new Date(birthDate);
              let age = today.getFullYear() - birth.getFullYear();
              const monthDiff = today.getMonth() - birth.getMonth();
              if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birth.getDate())
              ) {
                age--;
              }
              return age;
            };

            // Create medical record
            [medicalRecord] = await db
              .insert(patientMedicalRecords)
              .values({
                patientId: patientUserId, // Use user ID, not profile ID
                address: patientProfile.address || "",
                age: patient.dateOfBirth
                  ? calculateAge(patient.dateOfBirth)
                  : 0,
                birthDate: patient.dateOfBirth || "",
                contactNumber: patient.contactNumber || "",
                pmhx: "",
                fmhx: "",
                pshx: "",
              })
              .returning();

            console.log(
              `✅ Medical record created for patient user ${patientUserId}`
            );
          }
        }

        if (medicalRecord) {
          // Create visit record
          await db.insert(visits).values({
            medicalRecordId: medicalRecord.id,
            attendingDoctorId: appointment.doctorId,
            date: new Date(appointment.date),
            chiefComplaint: appointment.reason || null,
            status: "completed",
          });
          console.log(
            "✅ Visit record created for completed appointment:",
            appointmentId
          );
        } else {
          console.warn(
            "⚠️ Could not create medical record for patient user:",
            patientUserId
          );
        }
      } catch (visitError) {
        console.error("❌ Error creating visit record:", visitError);
        // Don't fail the appointment update if visit creation fails
      }
    }

    console.log("✅ Appointment updated:", appointmentId);

    res.json({
      status: true,
      result: updatedAppointment,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to update appointment",
    });
  }
});

// DELETE /api/appointments/:id - Cancel appointment
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const appointmentId = parseInt(req.params.id);
    const { reason } = req.body; // Get cancellation reason from request body

    // Get the appointment
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

    // Check authorization
    if (userRole === "patient") {
      const [patientProfile] = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId));

      if (!patientProfile || appointment.patientId !== patientProfile.id) {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Not authorized to cancel this appointment",
        });
      }
    } else if (userRole === "doctor") {
      const [doctorProfile] = await db
        .select()
        .from(doctorProfiles)
        .where(eq(doctorProfiles.userId, userId));

      if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Not authorized to cancel this appointment",
        });
      }
    }
    // Admin/Staff can cancel any appointment

    // Soft delete - update status to cancelled with reason
    const [cancelledAppointment] = await db
      .update(appointments)
      .set({
        status: "cancelled",
        cancellationReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    console.log("✅ Appointment cancelled:", appointmentId);

    res.json({
      status: true,
      result: cancelledAppointment,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error cancelling appointment:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to cancel appointment",
    });
  }
});
export default router;
