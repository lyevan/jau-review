import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function checkConstraints() {
  try {
    console.log(
      "🔍 Checking constraints on accounts_doctorschedule table...\n"
    );

    // Check all constraints on the table
    const constraints = await sql`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(c.oid) as definition
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'public.accounts_doctorschedule'::regclass
      ORDER BY conname;
    `;

    console.log("📋 Current constraints:");
    constraints.forEach((c: any) => {
      const type =
        {
          p: "PRIMARY KEY",
          u: "UNIQUE",
          f: "FOREIGN KEY",
          c: "CHECK",
        }[c.constraint_type] || c.constraint_type;

      console.log(`   ${c.constraint_name} (${type})`);
      console.log(`   Definition: ${c.definition}\n`);
    });

    // Check indexes
    const indexes = await sql`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'accounts_doctorschedule'
      AND schemaname = 'public';
    `;

    console.log("\n📊 Current indexes:");
    indexes.forEach((idx: any) => {
      console.log(`   ${idx.indexname}`);
      console.log(`   ${idx.indexdef}\n`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

checkConstraints();
