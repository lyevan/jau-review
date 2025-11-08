import { db } from "./db/index.js";
import { users } from "./db/schema.js";

async function testConnection() {
  try {
    console.log("🔌 Testing database connection...");

    const result = await db.select().from(users).limit(1);

    console.log("✅ Database connection successful!");
    console.log(`Found ${result.length} user(s) in database`);

    if (result.length > 0) {
      console.log("\nFirst user:");
      console.log(result[0]);
    } else {
      console.log(
        "\n⚠️  No users found in database. Run 'npm run seed' to create test users."
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
