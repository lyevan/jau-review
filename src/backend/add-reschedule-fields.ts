import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function addRescheduleFields() {
  try {
    console.log("🔄 Adding reschedule and cancellation fields...\n");

    // Add new columns
    await sql`
      ALTER TABLE appointments_appointment 
      ADD COLUMN IF NOT EXISTS proposed_date DATE,
      ADD COLUMN IF NOT EXISTS proposed_start_time TIME,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT
    `;

    console.log("✅ Fields added successfully!");
    console.log("   - proposed_date: Store doctor's proposed reschedule date");
    console.log(
      "   - proposed_start_time: Store doctor's proposed reschedule time"
    );
    console.log(
      "   - cancellation_reason: Store patient's cancellation reason\n"
    );
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

addRescheduleFields();
