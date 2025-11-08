import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function checkTablesExist() {
  try {
    console.log("\n========================================");
    console.log("📋 CHECKING IF TABLES EXIST");
    console.log("========================================\n");

    // Check which prescription-related tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%prescription%'
      ORDER BY table_name
    `;

    console.log(`✅ Found ${tables.length} prescription-related tables:\n`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });

    console.log("\n========================================\n");

    // Check columns in core_prescription table
    console.log("🔍 Checking columns in core_prescription table...\n");
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'core_prescription'
      ORDER BY ordinal_position
    `;

    if (columns.length === 0) {
      console.log("  ❌ Table core_prescription does NOT exist!");
      console.log("  You need to run database migration: npm run db:push");
    } else {
      console.log(
        `  ✅ Table core_prescription exists with ${columns.length} columns:\n`
      );
      columns.forEach((col) => {
        console.log(
          `    - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`
        );
      });
    }

    console.log("\n========================================\n");
    console.log("✅ Table check complete!\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sql.end();
  }
}

checkTablesExist();
