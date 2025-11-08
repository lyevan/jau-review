import { db } from "./db/index.js";
import { users, doctorProfiles } from "./db/schema.js";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

async function seedDoctors() {
  console.log("🌱 Seeding doctors...");

  const doctorsData = [
    {
      email: "sarah.cruz@clinic.com",
      password: "Doctor123",
      firstName: "Sarah",
      lastName: "Cruz",
      role: "doctor" as const,
      specialization: "Cardiologist",
      licenseNumber: "LIC-001-2010",
      yearsExperience: 12,
      medicalSchool: "University of Santo Tomas",
      biography:
        "Experienced cardiologist specializing in heart disease prevention and treatment.",
    },
    {
      email: "john.narvaez@clinic.com",
      password: "Doctor123",
      firstName: "John",
      lastName: "Narvaez",
      role: "doctor" as const,
      specialization: "Pediatrician",
      licenseNumber: "LIC-002-2008",
      yearsExperience: 15,
      medicalSchool: "Ateneo School of Medicine",
      biography:
        "Dedicated pediatrician focused on child health and development.",
    },
    {
      email: "maria.santos@clinic.com",
      password: "Doctor123",
      firstName: "Maria",
      lastName: "Santos",
      role: "doctor" as const,
      specialization: "Dermatologist",
      licenseNumber: "LIC-003-2013",
      yearsExperience: 10,
      medicalSchool: "De La Salle Medical Center",
      biography:
        "Skilled dermatologist treating various skin conditions and cosmetic concerns.",
    },
    {
      email: "robert.lim@clinic.com",
      password: "Doctor123",
      firstName: "Robert",
      lastName: "Lim",
      role: "doctor" as const,
      specialization: "Orthopedist",
      licenseNumber: "LIC-004-2005",
      yearsExperience: 18,
      medicalSchool: "University of the Philippines Manila",
      biography:
        "Experienced orthopedic surgeon specializing in sports injuries and joint replacement.",
    },
  ];

  for (const doctor of doctorsData) {
    try {
      // Check if doctor user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, doctor.email))
        .limit(1);

      let userId: number;

      if (existingUser.length > 0) {
        console.log(
          `👤 Doctor ${doctor.email} already exists, using existing user`
        );
        userId = existingUser[0].id;
      } else {
        // Hash password
        const hashedPassword = await bcryptjs.hash(doctor.password, 10);

        // Create user account
        const [newUser] = await db
          .insert(users)
          .values({
            username: doctor.email.split("@")[0],
            email: doctor.email,
            password: hashedPassword,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            role: doctor.role,
            isActive: true,
          })
          .returning();

        userId = newUser.id;
        console.log(`✅ Created doctor user: ${doctor.email}`);
      }

      // Check if doctor profile already exists
      const existingProfile = await db
        .select()
        .from(doctorProfiles)
        .where(eq(doctorProfiles.userId, userId))
        .limit(1);

      if (existingProfile.length === 0) {
        // Create doctor profile
        await db.insert(doctorProfiles).values({
          userId: userId,
          specialization: doctor.specialization,
          licenseNumber: doctor.licenseNumber,
          yearsExperience: doctor.yearsExperience,
          medicalSchool: doctor.medicalSchool,
          biography: doctor.biography,
          status: "active",
        });

        console.log(
          `✅ Created doctor profile for ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`
        );
      } else {
        console.log(`ℹ️  Doctor profile for ${doctor.email} already exists`);
      }
    } catch (error) {
      console.error(`❌ Error creating doctor ${doctor.email}:`, error);
    }
  }

  console.log("✅ Doctors seeding completed!");
  process.exit(0);
}

seedDoctors().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
