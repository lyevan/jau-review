import { db } from "./db/index.js";
import { users, patientProfiles, doctorProfiles } from "./db/schema.js";
import { eq } from "drizzle-orm";

async function seedProfiles() {
  console.log("🌱 Seeding user profiles...\n");

  // Get existing users
  const [patientUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "patient@gmail.com"));

  const [doctorUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "doctor@gmail.com"));

  if (!patientUser) {
    console.log("❌ Patient user not found! Run npm run seed first");
    process.exit(1);
  }

  if (!doctorUser) {
    console.log("❌ Doctor user not found! Run npm run seed first");
    process.exit(1);
  }

  // Create patient profile if doesn't exist
  const [existingPatient] = await db
    .select()
    .from(patientProfiles)
    .where(eq(patientProfiles.userId, patientUser.id));

  if (!existingPatient) {
    await db.insert(patientProfiles).values({
      userId: patientUser.id,
      address: "123 Main St, Cityville",
      emergencyContactName: "Jane Doe",
      emergencyContactNumber: "+1234567890",
      emergencyContactRelationship: "Spouse",
      bloodType: "O+",
    });
    console.log("✅ Created patient profile for:", patientUser.email);
  } else {
    console.log("⏭️  Patient profile already exists");
  }

  // Create doctor profile if doesn't exist
  const [existingDoctor] = await db
    .select()
    .from(doctorProfiles)
    .where(eq(doctorProfiles.userId, doctorUser.id));

  if (!existingDoctor) {
    await db.insert(doctorProfiles).values({
      userId: doctorUser.id,
      specialization: "General Physician",
      licenseNumber: "MD-12345",
      yearsExperience: 10,
      medicalSchool: "University Medical School",
      biography: "Experienced general physician with 10 years in practice",
      status: "active",
    });
    console.log("✅ Created doctor profile for:", doctorUser.email);
  } else {
    console.log("⏭️  Doctor profile already exists");
  }

  console.log("\n🎉 Profile seeding complete!");
  process.exit(0);
}

seedProfiles().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
