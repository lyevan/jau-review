import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function updateStatusConstraint() {
  try {
    console.log("🔄 Updating status check constraint...\n");

    // Drop the old constraint
    await sql`
      ALTER TABLE appointments_appointment 
      DROP CONSTRAINT IF EXISTS appointments_appointment_status_check
    `;

    console.log("✓ Dropped old constraint");

    // Add new constraint with reschedule_requested
    await sql`
      ALTER TABLE appointments_appointment 
      ADD CONSTRAINT appointments_appointment_status_check 
      CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'reschedule_requested'))
    `;

    console.log("✓ Added new constraint with reschedule_requested");

    console.log("\n✅ Status constraint updated successfully!");
    console.log("   - Added 'reschedule_requested' to allowed status values\n");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

updateStatusConstraint();
