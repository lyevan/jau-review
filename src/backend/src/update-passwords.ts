import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function updatePasswords() {
  console.log("🔐 Updating user passwords to bcrypt format...\n");

  const userUpdates = [
    { email: "superadmin@gmail.com", password: "Admin123" },
    { email: "admin@gmail.com", password: "Admin123" },
    { email: "doctor@gmail.com", password: "Doctor123" },
    { email: "patient@gmail.com", password: "Patient123" },
    { email: "staff@gmail.com", password: "Staff123" },
  ];

  for (const userUpdate of userUpdates) {
    try {
      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, userUpdate.email));

      if (!user) {
        console.log(`⏭️  Skipped: ${userUpdate.email} (user not found)`);
        continue;
      }

      // Hash new password with bcrypt
      const hashedPassword = await bcrypt.hash(userUpdate.password, 10);

      // Update user password
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, userUpdate.email));

      console.log(
        `✅ Updated: ${userUpdate.email} → password: ${userUpdate.password}`
      );
    } catch (error) {
      console.error(`❌ Failed to update ${userUpdate.email}:`, error);
    }
  }

  console.log("\n🎉 Password update complete!");
  console.log("\nUpdated credentials:");
  console.log("===================");
  userUpdates.forEach((u) => {
    console.log(`${u.email.padEnd(30)} - ${u.password}`);
  });

  process.exit(0);
}

updatePasswords().catch((error) => {
  console.error("❌ Password update failed:", error);
  process.exit(1);
});
