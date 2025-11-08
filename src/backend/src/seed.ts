import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  const testUsers = [
    {
      email: "admin@gmail.com",
      firstName: "Admin",
      lastName: "User",
      username: "admin_test",
      password: "Admin123",
      role: "admin" as const,
    },
    {
      email: "doctor@gmail.com",
      firstName: "Doctor",
      lastName: "Smith",
      username: "doctor_test",
      password: "Doctor123",
      role: "doctor" as const,
    },
    {
      email: "patient@gmail.com",
      firstName: "Patient",
      lastName: "Doe",
      username: "patient_test",
      password: "Patient123",
      role: "patient" as const,
    },
    {
      email: "staff@gmail.com",
      firstName: "Staff",
      lastName: "Member",
      username: "staff_test",
      password: "Staff123",
      role: "staff" as const,
    },
  ];

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email));

      if (existingUser) {
        console.log(`⏭️  Skipped: ${user.email} (already exists)`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user
      await db.insert(users).values({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: hashedPassword,
        role: user.role,
        isActive: true,
        dateJoined: new Date(),
      });

      console.log(`✅ Created: ${user.email} (password: ${user.password})`);
    } catch (error) {
      console.error(`❌ Failed to create ${user.email}:`, error);
    }
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\nTest credentials:");
  console.log("================");
  testUsers.forEach((u) => {
    console.log(`${u.role.padEnd(10)} - ${u.email.padEnd(25)} - ${u.password}`);
  });

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
