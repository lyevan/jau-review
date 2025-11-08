import { db } from "./db/index.js";
import { users, patientProfiles } from "./db/schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

async function seedPatients() {
  console.log("🌱 Seeding patients...");

  const patientsData = [
    {
      email: "maria.garcia@patient.com",
      password: "Patient123",
      firstName: "Maria",
      lastName: "Garcia",
      role: "patient" as const,
      contactNumber: "+63 917 123 4567",
      dateOfBirth: "1990-05-15",
      gender: "female" as const,
      civilStatus: "Single",
      address: "123 Main Street, Quezon City, Metro Manila",
      emergencyContactName: "Juan Garcia",
      emergencyContactNumber: "+63 917 765 4321",
      emergencyContactRelationship: "Father",
    },
    {
      email: "juan.dela.cruz@patient.com",
      password: "Patient123",
      firstName: "Juan",
      lastName: "Dela Cruz",
      role: "patient" as const,
      contactNumber: "+63 918 234 5678",
      dateOfBirth: "1985-08-22",
      gender: "male" as const,
      civilStatus: "Married",
      address: "456 Oak Avenue, Makati City, Metro Manila",
      emergencyContactName: "Ana Dela Cruz",
      emergencyContactNumber: "+63 918 876 5432",
      emergencyContactRelationship: "Wife",
    },
    {
      email: "ana.reyes@patient.com",
      password: "Patient123",
      firstName: "Ana",
      lastName: "Reyes",
      role: "patient" as const,
      contactNumber: "+63 919 345 6789",
      dateOfBirth: "1995-12-10",
      gender: "female" as const,
      civilStatus: "Single",
      address: "789 Pine Road, Pasig City, Metro Manila",
      emergencyContactName: "Pedro Reyes",
      emergencyContactNumber: "+63 919 987 6543",
      emergencyContactRelationship: "Brother",
    },
    {
      email: "carlos.santos@patient.com",
      password: "Patient123",
      firstName: "Carlos",
      lastName: "Santos",
      role: "patient" as const,
      contactNumber: "+63 920 456 7890",
      dateOfBirth: "1988-03-28",
      gender: "male" as const,
      civilStatus: "Married",
      address: "321 Elm Street, Taguig City, Metro Manila",
      emergencyContactName: "Rosa Santos",
      emergencyContactNumber: "+63 920 098 7654",
      emergencyContactRelationship: "Mother",
    },
    {
      email: "lisa.tan@patient.com",
      password: "Patient123",
      firstName: "Lisa",
      lastName: "Tan",
      role: "patient" as const,
      contactNumber: "+63 921 567 8901",
      dateOfBirth: "1992-07-05",
      gender: "female" as const,
      civilStatus: "Single",
      address: "654 Maple Lane, Mandaluyong City, Metro Manila",
      emergencyContactName: "Michael Tan",
      emergencyContactNumber: "+63 921 109 8765",
      emergencyContactRelationship: "Father",
    },
  ];

  for (const patient of patientsData) {
    try {
      // Check if patient user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, patient.email))
        .limit(1);

      let userId: number;

      if (existingUser.length > 0) {
        console.log(
          `👤 Patient ${patient.email} already exists, using existing user`
        );
        userId = existingUser[0].id;
      } else {
        // Hash password
        const hashedPassword = await bcryptjs.hash(patient.password, 10);

        // Create user account
        const [newUser] = await db
          .insert(users)
          .values({
            username: patient.email.split("@")[0],
            email: patient.email,
            password: hashedPassword,
            firstName: patient.firstName,
            lastName: patient.lastName,
            contactNumber: patient.contactNumber,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            role: patient.role,
            isActive: true,
          })
          .returning();

        userId = newUser.id;
        console.log(`✅ Created patient user: ${patient.email}`);
      }

      // Check if patient profile already exists
      const existingProfile = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId))
        .limit(1);

      if (existingProfile.length === 0) {
        // Create patient profile
        await db.insert(patientProfiles).values({
          userId: userId,
          civilStatus: patient.civilStatus,
          address: patient.address,
          emergencyContactName: patient.emergencyContactName,
          emergencyContactNumber: patient.emergencyContactNumber,
          emergencyContactRelationship: patient.emergencyContactRelationship,
        });

        console.log(
          `✅ Created patient profile for ${patient.firstName} ${patient.lastName}`
        );
      } else {
        console.log(`ℹ️  Patient profile for ${patient.email} already exists`);
      }
    } catch (error) {
      console.error(`❌ Error creating patient ${patient.email}:`, error);
    }
  }

  console.log("✅ Patients seeding completed!");
  console.log("\n📋 Patient Login Credentials:");
  console.log("================================");
  patientsData.forEach((p) => {
    console.log(`Email: ${p.email}`);
    console.log(`Password: ${p.password}`);
    console.log(`Name: ${p.firstName} ${p.lastName}`);
    console.log("---");
  });
  process.exit(0);
}

seedPatients().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
