import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function checkTables() {
  try {
    console.log("\n========================================");
    console.log("📊 CHECKING DATABASE TABLES");
    console.log("========================================\n");

    // Check core_visit table
    console.log("🔍 Checking core_visit table...\n");
    const visitsResult = await sql`
      SELECT 
        id,
        medical_record_id,
        date,
        chief_complaint,
        created_at
      FROM core_visit
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log(`✅ Found ${visitsResult.length} visits (showing last 10):`);
    visitsResult.forEach((visit, index) => {
      console.log(`\n  Visit ${index + 1}:`);
      console.log(`    ID: ${visit.id}`);
      console.log(`    Medical Record ID: ${visit.medical_record_id}`);
      console.log(`    Date: ${visit.date}`);
      console.log(`    Chief Complaint: ${visit.chief_complaint || "N/A"}`);
      console.log(`    Created: ${visit.created_at}`);
    });

    console.log("\n========================================\n");

    // Check core_prescription table (NEW)
    console.log(
      "🔍 Checking core_prescription table (NEW prescription system)...\n"
    );
    const prescriptionsResult = await sql`
      SELECT 
        id,
        visit_id,
        patient_id,
        doctor_id,
        status,
        notes,
        created_at,
        created_by_id
      FROM core_prescription
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log(
      `✅ Found ${prescriptionsResult.length} prescriptions (showing last 10):`
    );
    if (prescriptionsResult.length === 0) {
      console.log("  ❌ NO PRESCRIPTIONS FOUND IN DATABASE!");
      console.log(
        "  This means prescription creation is NOT saving to the database."
      );
    } else {
      prescriptionsResult.forEach((prescription, index) => {
        console.log(`\n  Prescription ${index + 1}:`);
        console.log(`    ID: ${prescription.id}`);
        console.log(`    Visit ID: ${prescription.visit_id}`);
        console.log(`    Patient ID: ${prescription.patient_id}`);
        console.log(`    Doctor ID: ${prescription.doctor_id}`);
        console.log(`    Status: ${prescription.status}`);
        console.log(`    Notes: ${prescription.notes || "N/A"}`);
        console.log(`    Created By: ${prescription.created_by_id}`);
        console.log(`    Created: ${prescription.created_at}`);
      });
    }

    console.log("\n========================================\n");

    // Check prescription items table (NEW)
    console.log(
      "🔍 Checking core_prescription_item table (NEW prescription items)...\n"
    );
    const itemsResult = await sql`
      SELECT 
        id,
        prescription_id,
        medicine_id,
        quantity,
        dosage,
        frequency,
        duration,
        instructions
      FROM core_prescription_item
      ORDER BY id DESC
      LIMIT 10
    `;

    console.log(
      `✅ Found ${itemsResult.length} prescription items (showing last 10):`
    );
    if (itemsResult.length === 0) {
      console.log("  ❌ NO PRESCRIPTION ITEMS FOUND IN DATABASE!");
    } else {
      itemsResult.forEach((item, index) => {
        console.log(`\n  Item ${index + 1}:`);
        console.log(`    ID: ${item.id}`);
        console.log(`    Prescription ID: ${item.prescription_id}`);
        console.log(`    Medicine ID: ${item.medicine_id}`);
        console.log(`    Quantity: ${item.quantity}`);
        console.log(`    Dosage: ${item.dosage}`);
        console.log(`    Frequency: ${item.frequency}`);
        console.log(`    Duration: ${item.duration}`);
        console.log(`    Instructions: ${item.instructions || "N/A"}`);
      });
    }

    console.log("\n========================================\n");

    // Check if there are any visits WITH prescriptions (NEW system)
    console.log("🔗 Checking visits WITH prescriptions (NEW system)...\n");
    const joinResult = await sql`
      SELECT 
        v.id as visit_id,
        v.date as visit_date,
        v.chief_complaint,
        p.id as prescription_id,
        p.status as prescription_status,
        COUNT(pi.id) as item_count
      FROM core_visit v
      LEFT JOIN core_prescription p ON v.id = p.visit_id
      LEFT JOIN core_prescription_item pi ON p.id = pi.prescription_id
      WHERE p.id IS NOT NULL
      GROUP BY v.id, v.date, v.chief_complaint, p.id, p.status
      ORDER BY v.date DESC
      LIMIT 10
    `;

    console.log(`✅ Found ${joinResult.length} visits with prescriptions:`);
    if (joinResult.length === 0) {
      console.log("  ❌ NO VISITS HAVE PRESCRIPTIONS LINKED!");
    } else {
      joinResult.forEach((row, index) => {
        console.log(
          `\n  ${index + 1}. Visit ID ${row.visit_id} (${row.visit_date}):`
        );
        console.log(`     Chief Complaint: ${row.chief_complaint || "N/A"}`);
        console.log(`     Prescription ID: ${row.prescription_id}`);
        console.log(`     Status: ${row.prescription_status}`);
        console.log(`     Items: ${row.item_count}`);
      });
    }

    console.log("\n========================================\n");
    console.log("✅ Database check complete!\n");
  } catch (error) {
    console.error("❌ Error checking database:", error);
    console.error("Error details:", error.message);
  } finally {
    await sql.end();
  }
}

checkTables();
