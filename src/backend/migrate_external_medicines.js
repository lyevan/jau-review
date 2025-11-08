// Migration script to add external medicine support
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "clinic_db",
  password: "postgres",
  port: 5432,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("🔄 Starting migration: Add external medicine support...\n");

    await client.query("BEGIN");

    // Step 1: Make medicineId nullable
    console.log("Step 1: Making medicine_id nullable...");
    await client.query(`
      ALTER TABLE core_prescription_item 
      ALTER COLUMN medicine_id DROP NOT NULL;
    `);
    console.log("✅ medicine_id is now nullable\n");

    // Step 2: Drop and recreate FK constraint with SET NULL
    console.log("Step 2: Updating foreign key constraint...");
    await client.query(`
      ALTER TABLE core_prescription_item 
      DROP CONSTRAINT IF EXISTS core_prescription_item_medicine_id_medicine_inventory_pos_medicine_id_fk;
    `);
    await client.query(`
      ALTER TABLE core_prescription_item
      ADD CONSTRAINT core_prescription_item_medicine_id_medicine_inventory_pos_medicine_id_fk 
      FOREIGN KEY (medicine_id) 
      REFERENCES medicine_inventory_pos_medicine(id) 
      ON DELETE SET NULL;
    `);
    console.log("✅ FK constraint updated to SET NULL\n");

    // Step 3: Add medicine_name column
    console.log("Step 3: Adding medicine_name column...");
    await client.query(`
      ALTER TABLE core_prescription_item 
      ADD COLUMN IF NOT EXISTS medicine_name VARCHAR(255);
    `);
    console.log("✅ medicine_name column added\n");

    // Step 4: Add is_external column
    console.log("Step 4: Adding is_external flag...");
    await client.query(`
      ALTER TABLE core_prescription_item 
      ADD COLUMN IF NOT EXISTS is_external BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    console.log("✅ is_external column added\n");

    // Step 5: Add check constraint
    console.log("Step 5: Adding validation constraint...");
    await client.query(`
      ALTER TABLE core_prescription_item
      ADD CONSTRAINT check_medicine_reference 
      CHECK (
        (medicine_id IS NOT NULL) OR 
        (medicine_name IS NOT NULL AND medicine_name != '')
      );
    `);
    console.log("✅ Validation constraint added\n");

    // Step 6: Create indexes
    console.log("Step 6: Creating indexes...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_prescription_item_medicine_name 
      ON core_prescription_item(medicine_name);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_prescription_item_is_external 
      ON core_prescription_item(is_external);
    `);
    console.log("✅ Indexes created\n");

    await client.query("COMMIT");
    console.log("✅ Migration completed successfully!\n");

    // Verify the changes
    console.log("🔍 Verifying schema changes...");
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'core_prescription_item'
      ORDER BY ordinal_position;
    `);

    console.log("\nUpdated schema:");
    result.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log("\n✅ All done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Error:", err);
    process.exit(1);
  });
