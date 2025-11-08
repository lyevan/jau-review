import { z } from "zod";

/**
 * Schema for creating a visit with diagnosis, vitals, and prescriptions
 */
export const createVisitSchema = z.object({
  appointmentId: z.number().optional(),
  patientId: z.number({
    required_error: "Patient ID is required",
  }),
  serviceId: z.number().optional(), // Consultation service for pricing
  chiefComplaint: z.string().optional(),
  diagnoses: z
    .array(
      z.object({
        diagnosisCode: z
          .string()
          .min(1, "ICD-10 code is required for analytics"),
        diagnosisDescription: z
          .string()
          .min(1, "Diagnosis description is required"),
      })
    )
    .optional(), // Make optional - we'll validate manually in the component
  vitals: z
    .object({
      bloodPressure: z.string().optional(),
      temperature: z.string().optional(),
      heartRate: z.number().optional(),
      respiratoryRate: z.number().optional(),
      weight: z.string().optional(),
      height: z.string().optional(),
      oxygenSaturation: z.number().optional(),
    })
    .optional(),
  prescriptions: z
    .array(
      z.object({
        medicineId: z.number(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        dosage: z.string().optional(),
        frequency: z.string().optional(),
        duration: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .optional(),
  prescriptionNotes: z.string().optional(),
});

export type CreateVisitSchema = z.infer<typeof createVisitSchema>;
