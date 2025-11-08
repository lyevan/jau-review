import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function fixConstraint() {
  try {
    console.log("🔧 Fixing the unique constraint issue...\n");

    // First, drop the constraint (not the index)
    console.log("1️⃣ Dropping unique constraint...");
    await sql.unsafe(`
      ALTER TABLE accounts_doctorschedule 
      DROP CONSTRAINT IF EXISTS accounts_doctorschedule_doctor_id_day_key CASCADE;
    `);
    console.log("   ✅ Unique constraint dropped\n");

    // Then drop the index if it still exists
    console.log("2️⃣ Dropping unique index (if still exists)...");
    await sql.unsafe(`
      DROP INDEX IF EXISTS accounts_doctorschedule_doctor_id_day_key CASCADE;
    `);
    console.log("   ✅ Unique index dropped\n");

    // Create non-unique index for performance
    console.log("3️⃣ Creating non-unique index for performance...");
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_doctor_schedule_doctor_day 
      ON accounts_doctorschedule(doctor_id, day);
    `);
    console.log("   ✅ Non-unique index created\n");

    // Final verification
    console.log("4️⃣ Final verification...");
    const finalCheck = await sql`
      SELECT 
        conname as constraint_name,
        contype as type
      FROM pg_constraint 
      WHERE conrelid = 'public.accounts_doctorschedule'::regclass
      AND contype = 'u'
      ORDER BY conname;
    `;

    if (finalCheck.length === 0) {
      console.log("   ✅ No unique constraints found - SUCCESS!\n");
    } else {
      console.log("   ⚠️ Found unique constraints:");
      finalCheck.forEach((c: any) => {
        console.log(`      - ${c.constraint_name}`);
      });
    }

    console.log(
      "\n🎉 Migration completed! Doctors can now have multiple time blocks per day."
    );
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

fixConstraint();
