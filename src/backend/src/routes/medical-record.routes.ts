import { Router } from "express";
import { db } from "../db/index.js";
import {
  patientMedicalRecords,
  users,
  visits,
  visitVitals,
  visitDiagnoses,
  patientProfiles,
} from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/medical-records - Get patient's medical record
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let medicalRecord;

    if (userRole === "patient") {
      // Get patient's own medical record
      const [record] = await db
        .select({
          id: patientMedicalRecords.id,
          patientId: patientMedicalRecords.patientId,
          address: patientMedicalRecords.address,
          age: patientMedicalRecords.age,
          birthDate: patientMedicalRecords.birthDate,
          contactNumber: patientMedicalRecords.contactNumber,
          pmhx: patientMedicalRecords.pmhx,
          fmhx: patientMedicalRecords.fmhx,
          pshx: patientMedicalRecords.pshx,
          createdAt: patientMedicalRecords.createdAt,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(patientMedicalRecords)
        .leftJoin(users, eq(patientMedicalRecords.patientId, users.id))
        .where(eq(patientMedicalRecords.patientId, userId));

      medicalRecord = record;
    } else {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Only patients can access this endpoint.",
      });
    }

    if (!medicalRecord) {
      // Auto-create medical record for patients who don't have one
      console.log(`📝 Auto-creating medical record for patient ${userId}`);

      // Get patient user data and profile
      const [patient] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!patient) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "Patient not found",
        });
      }

      // Get patient profile for address
      const [patientProfile] = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId));

      // Calculate age from date of birth
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
      const [newRecord] = await db
        .insert(patientMedicalRecords)
        .values({
          patientId: userId,
          address: patientProfile?.address || "",
          age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0,
          birthDate: patient.dateOfBirth || "",
          contactNumber: patient.contactNumber || "",
          pmhx: "",
          fmhx: "",
          pshx: "",
        })
        .returning();

      // Return the newly created record with patient info
      medicalRecord = {
        ...newRecord,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
      };

      console.log(`✅ Medical record created for patient ${userId}`);
    }

    res.json({
      status: true,
      result: medicalRecord,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching medical record:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch medical record",
    });
  }
});

// GET /api/medical-records/visits - Get patient's visit history
router.get("/visits", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let visitHistory = [];

    if (userRole === "patient") {
      // Get medical record first
      const [medicalRecord] = await db
        .select()
        .from(patientMedicalRecords)
        .where(eq(patientMedicalRecords.patientId, userId));

      // If no medical record exists, return empty array instead of 404
      if (!medicalRecord) {
        return res.json({
          status: true,
          result: [],
          error: null,
        });
      }

      // Get all visits
      const visitsList = await db
        .select({
          id: visits.id,
          medicalRecordId: visits.medicalRecordId,
          attendingDoctorId: visits.attendingDoctorId,
          chiefComplaint: visits.chiefComplaint,
          status: visits.status,
          date: visits.date,
          createdAt: visits.createdAt,
        })
        .from(visits)
        .where(eq(visits.medicalRecordId, medicalRecord.id))
        .orderBy(desc(visits.date));

      // For each visit, get vitals and diagnoses
      visitHistory = await Promise.all(
        visitsList.map(async (visit) => {
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

          return {
            ...visit,
            vitals: vitals || null,
            diagnoses: diagnoses || [],
          };
        })
      );
    } else {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied",
      });
    }

    res.json({
      status: true,
      result: visitHistory || [],
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching visit history:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch visit history",
    });
  }
});

export default router;
