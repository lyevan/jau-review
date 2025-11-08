import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function verifyUser() {
  const email = "patient@gmail.com";
  const password = "Patient123";

  console.log(`🔍 Verifying user: ${email}\n`);

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    console.log("❌ User not found!");
    process.exit(1);
  }

  console.log("User found:");
  console.log("- ID:", user.id);
  console.log("- Email:", user.email);
  console.log("- Username:", user.username);
  console.log("- Role:", user.role);
  console.log("- Active:", user.isActive);
  console.log("- Password hash:", user.password.substring(0, 60) + "...");
  console.log(
    "- Hash type:",
    user.password.startsWith("$2") ? "bcrypt ✅" : "Django pbkdf2 ❌"
  );

  console.log("\n🔐 Testing password verification...");

  try {
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Password "${password}":`, isValid ? "✅ VALID" : "❌ INVALID");
  } catch (error) {
    console.log("❌ bcrypt.compare error:", error);
  }

  process.exit(0);
}

verifyUser().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
