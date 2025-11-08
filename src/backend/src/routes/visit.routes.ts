import { Router } from "express";
import { db } from "../db/index.js";
import {
  visits,
  visitVitals,
  visitDiagnoses,
  patientMedicalRecords,
  patientProfiles,
  appointments,
  users,
  consultationPayments,
  consultationServices,
  doctorProfiles,
} from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/visits - Create visit record with diagnosis and vitals
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only doctors can create visit records
    if (userRole !== "doctor") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Doctor access required.",
      });
    }

    const {
      appointmentId,
      patientId, // This is the patient profile ID
      serviceId, // Consultation service ID for pricing
      chiefComplaint,
      diagnoses, // Array of { diagnosisCode, diagnosisDescription }
      vitals, // Object with vital signs
    } = req.body;

    // Validate required fields
    if (!patientId) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Patient ID is required",
      });
    }

    // Get patient profile to find the user ID
    const [patientProfile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.id, patientId));

    if (!patientProfile) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Patient profile not found",
      });
    }

    const patientUserId = patientProfile.userId;

    // Get or create medical record
    let [medicalRecord] = await db
      .select()
      .from(patientMedicalRecords)
      .where(eq(patientMedicalRecords.patientId, patientUserId));

    // If no medical record exists, create one automatically
    if (!medicalRecord) {
      console.log(
        `📝 Auto-creating medical record for patient user ${patientUserId}`
      );

      const [patient] = await db
        .select()
        .from(users)
        .where(eq(users.id, patientUserId));

      if (patient) {
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

        [medicalRecord] = await db
          .insert(patientMedicalRecords)
          .values({
            patientId: patientUserId,
            address: patientProfile.address || "",
            age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0,
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
      } else {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Patient user not found",
        });
      }
    }

    // Create visit record
    const [visit] = await db
      .insert(visits)
      .values({
        medicalRecordId: medicalRecord.id,
        attendingDoctorId: req.user!.id,
        date: new Date(),
        chiefComplaint: chiefComplaint || null,
        status: "completed",
      })
      .returning();

    console.log("✅ Visit record created:", visit.id);

    // Create vitals if provided
    let createdVitals = null;
    if (vitals && Object.keys(vitals).length > 0) {
      [createdVitals] = await db
        .insert(visitVitals)
        .values({
          visitId: visit.id,
          bloodPressure: vitals.bloodPressure || null,
          temperature: vitals.temperature || null,
          heartRate: vitals.heartRate || null,
          respiratoryRate: vitals.respiratoryRate || null,
          weight: vitals.weight || null,
          height: vitals.height || null,
          oxygenSaturation: vitals.oxygenSaturation || null,
        })
        .returning();

      console.log("✅ Vitals created for visit:", visit.id);
    }

    // Create diagnoses if provided
    let createdDiagnoses: any[] = [];
    if (diagnoses && Array.isArray(diagnoses) && diagnoses.length > 0) {
      for (const diagnosis of diagnoses) {
        if (diagnosis.diagnosisDescription) {
          const [createdDiagnosis] = await db
            .insert(visitDiagnoses)
            .values({
              visitId: visit.id,
              diagnosisCode: diagnosis.diagnosisCode || null,
              diagnosisDescription: diagnosis.diagnosisDescription,
            })
            .returning();

          createdDiagnoses.push(createdDiagnosis);
        }
      }
      console.log(
        `✅ ${createdDiagnoses.length} diagnoses created for visit:`,
        visit.id
      );
    }

    // Create pending consultation payment if appointmentId is provided
    let consultationPayment = null;
    if (appointmentId) {
      try {
        // Get appointment details to find doctor profile ID
        const [appointment] = await db
          .select()
          .from(appointments)
          .where(eq(appointments.id, appointmentId));

        if (appointment) {
          // Get doctor user ID from appointment
          const [doctorProfile] = await db
            .select()
            .from(doctorProfiles)
            .where(eq(doctorProfiles.id, appointment.doctorId));

          if (doctorProfile) {
            // Get service details for pricing
            let consultationFee = 500; // Default fallback
            let actualServiceId = serviceId;

            if (serviceId) {
              const [service] = await db
                .select()
                .from(consultationServices)
                .where(eq(consultationServices.id, serviceId));

              if (service && service.isActive) {
                consultationFee = parseFloat(service.price.toString());
              } else {
                console.warn("⚠️ Invalid or inactive service, using default");
                actualServiceId = null;
              }
            } else {
              // Try to get default "General Consultation" service
              const [defaultService] = await db
                .select()
                .from(consultationServices)
                .where(eq(consultationServices.name, "General Consultation"));

              if (defaultService) {
                consultationFee = parseFloat(defaultService.price.toString());
                actualServiceId = defaultService.id;
              }
            }

            // Generate unique transaction ID
            const transactionId = `CONS-${Date.now()}-${appointmentId}`;

            [consultationPayment] = await db
              .insert(consultationPayments)
              .values({
                transactionId,
                appointmentId: appointment.id,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                serviceId: actualServiceId,
                status: "pending",
                consultationFee: consultationFee.toString(),
                tax: "0",
                totalAmount: consultationFee.toString(),
              })
              .returning();

            console.log(
              `✅ Pending consultation payment created: ${consultationPayment.id}, Fee: ₱${consultationFee}`
            );
          }
        }
      } catch (paymentError) {
        console.error(
          "⚠️ Failed to create consultation payment:",
          paymentError
        );
        // Don't fail the whole request if payment creation fails
      }
    }

    return res.json({
      status: true,
      result: {
        visit,
        vitals: createdVitals,
        diagnoses: createdDiagnoses,
        consultationPayment,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating visit:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create visit record",
    });
  }
});

// GET /api/visits/appointment/:appointmentId - Get visit details by appointment ID
router.get(
  "/appointment/:appointmentId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userRole = req.user!.role;
      const appointmentId = parseInt(req.params.appointmentId);

      // Only doctors and patients can view visit details
      if (userRole !== "doctor" && userRole !== "patient") {
        return res.status(403).json({
          status: false,
          result: null,
          error: "Access denied.",
        });
      }

      // Find the visit associated with this appointment
      // First, get the appointment to find the patient
      const [appointment] = await db
        .select({
          id: appointments.id,
          patientId: appointments.patientId,
          date: appointments.date,
          reason: appointments.reason,
        })
        .from(appointments)
        .where(eq(appointments.id, appointmentId));

      if (!appointment) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Appointment not found",
        });
      }

      // Get patient profile to find user ID
      const [patientProfile] = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.id, appointment.patientId));

      if (!patientProfile) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Patient profile not found",
        });
      }

      // Get medical record
      const [medicalRecord] = await db
        .select()
        .from(patientMedicalRecords)
        .where(eq(patientMedicalRecords.patientId, patientProfile.userId));

      if (!medicalRecord) {
        return res.json({
          status: true,
          result: null,
          error: null,
        });
      }

      // Find visit for this appointment date
      const [visit] = await db
        .select()
        .from(visits)
        .where(
          and(
            eq(visits.medicalRecordId, medicalRecord.id),
            eq(sql`DATE(${visits.date})`, appointment.date)
          )
        )
        .orderBy(desc(visits.createdAt))
        .limit(1);

      if (!visit) {
        return res.json({
          status: true,
          result: null,
          error: null,
        });
      }

      // Get vitals
      const [vitals] = await db
        .select()
        .from(visitVitals)
        .where(eq(visitVitals.visitId, visit.id));

      // Get diagnoses
      const diagnoses = await db
        .select()
        .from(visitDiagnoses)
        .where(eq(visitDiagnoses.visitId, visit.id));

      return res.json({
        status: true,
        result: {
          visit,
          vitals: vitals || null,
          diagnoses: diagnoses || [],
        },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error fetching visit details:", error);
      return res.status(500).json({
        status: false,
        result: null,
        error: "Failed to fetch visit details",
      });
    }
  }
);

export default router;
