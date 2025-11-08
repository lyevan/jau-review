import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function removeConstraint() {
  try {
    console.log("🔄 Removing unique constraint to allow conflicts...\n");

    // Drop the unique constraint
    await sql`
      ALTER TABLE appointments_appointment 
      DROP CONSTRAINT IF EXISTS appointments_appointment_doctor_id_date_start_time_end_time_key
    `;

    console.log("✅ Unique constraint removed successfully!");
    console.log("   - Multiple patients can now book the same time slot");
    console.log("   - Conflicts will be detected by the priority system\n");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

removeConstraint();
