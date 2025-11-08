import { db } from "./db/index.js";
import { patientProfiles, doctorProfiles, appointments } from "./db/schema.js";
import { eq } from "drizzle-orm";

async function seedAppointments() {
  console.log("🌱 Seeding appointments...\n");

  // Get patient and doctor profiles
  const [patient] = await db.select().from(patientProfiles).limit(1);

  const [doctor] = await db.select().from(doctorProfiles).limit(1);

  if (!patient) {
    console.log("❌ No patient profile found. Run seed-profiles.ts first!");
    process.exit(1);
  }

  if (!doctor) {
    console.log("❌ No doctor profile found. Run seed-profiles.ts first!");
    process.exit(1);
  }

  console.log(`✅ Found patient ID: ${patient.id}`);
  console.log(`✅ Found doctor ID: ${doctor.id}\n`);

  const testAppointments = [
    {
      patientId: patient.id,
      doctorId: doctor.id,
      date: "2025-10-28",
      startTime: "09:00:00",
      endTime: "09:30:00",
      status: "confirmed" as const,
      reason: "Regular checkup",
    },
    {
      patientId: patient.id,
      doctorId: doctor.id,
      date: "2025-10-30",
      startTime: "14:00:00",
      endTime: "14:30:00",
      status: "pending" as const,
      reason: "Follow-up consultation",
    },
    {
      patientId: patient.id,
      doctorId: doctor.id,
      date: "2025-10-25",
      startTime: "10:00:00",
      endTime: "10:30:00",
      status: "completed" as const,
      reason: "Initial consultation",
    },
  ];

  for (const appointment of testAppointments) {
    try {
      await db.insert(appointments).values(appointment);
      console.log(
        `✅ Created appointment: ${appointment.date} at ${appointment.startTime} (${appointment.status})`
      );
    } catch (error) {
      console.error(`❌ Failed to create appointment:`, error);
    }
  }

  console.log("\n🎉 Appointment seeding complete!");
  process.exit(0);
}

seedAppointments().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
