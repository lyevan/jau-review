import { db } from "./db/index.js";
import { patientMedicalRecords, users } from "./db/schema.js";
import { eq } from "drizzle-orm";

async function seedMedicalRecords() {
  console.log("🌱 Seeding medical records...");

  try {
    // Get patient user
    const [patientUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "patient@gmail.com"));

    if (!patientUser) {
      console.error("❌ Patient user not found");
      process.exit(1);
    }

    // Check if medical record already exists
    const existingRecord = await db
      .select()
      .from(patientMedicalRecords)
      .where(eq(patientMedicalRecords.patientId, patientUser.id));

    if (existingRecord.length > 0) {
      console.log("ℹ️  Medical record already exists for patient");
    } else {
      // Create medical record
      await db.insert(patientMedicalRecords).values({
        patientId: patientUser.id,
        address: "123 Main Street, Manila, Philippines",
        age: 30,
        birthDate: "1995-01-15",
        contactNumber: "+63 912 345 6789",
        pmhx: "No significant past medical history. Occasional seasonal allergies.",
        fmhx: "Father: Hypertension, Mother: Type 2 Diabetes",
        pshx: "No previous surgeries",
      });

      console.log("✅ Created medical record for patient@gmail.com");
    }

    console.log("✅ Medical records seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedMedicalRecords();
