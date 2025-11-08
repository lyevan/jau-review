import { db } from "./src/db/index.ts";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("🔄 Running database migration for visits tables...");

  try {
    // Create visit_status enum if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE visit_status AS ENUM ('scheduled', 'completed', 'canceled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create core_visit table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS core_visit (
        id SERIAL PRIMARY KEY,
        medical_record_id INTEGER NOT NULL REFERENCES core_patientmedicalrecord(id) ON DELETE CASCADE,
        attending_doctor_id INTEGER REFERENCES accounts_user(id) ON DELETE SET NULL,
        date TIMESTAMP DEFAULT NOW(),
        chief_complaint TEXT,
        status visit_status DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create core_visitvitals table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS core_visitvitals (
        id SERIAL PRIMARY KEY,
        visit_id INTEGER NOT NULL REFERENCES core_visit(id) ON DELETE CASCADE,
        blood_pressure VARCHAR(20),
        temperature DECIMAL(4, 2),
        heart_rate INTEGER,
        respiratory_rate INTEGER,
        weight DECIMAL(5, 2),
        height DECIMAL(5, 2),
        oxygen_saturation INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create core_visitdiagnosis table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS core_visitdiagnosis (
        id SERIAL PRIMARY KEY,
        visit_id INTEGER NOT NULL REFERENCES core_visit(id) ON DELETE CASCADE,
        diagnosis_code VARCHAR(50),
        diagnosis_description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create core_visitprescription table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS core_visitprescription (
        id SERIAL PRIMARY KEY,
        visit_id INTEGER NOT NULL REFERENCES core_visit(id) ON DELETE CASCADE,
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        duration VARCHAR(100),
        instructions TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_visit_medical_record ON core_visit(medical_record_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_visit_doctor ON core_visit(attending_doctor_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_visit_date ON core_visit(date);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_visitvitals_visit ON core_visitvitals(visit_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_visitdiagnosis_visit ON core_visitdiagnosis(visit_id);`
    );
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_visitprescription_visit ON core_visitprescription(visit_id);`
    );

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
