import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  date,
  time,
  decimal,
  pgEnum,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const genderEnum = pgEnum("gender_type", ["male", "female", "other"]);
export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "admin",
  "doctor",
  "staff",
  "patient",
]);
export const statusEnum = pgEnum("status_type", [
  "active",
  "inactive",
  "on_leave",
]);
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "arrived",
  "cancelled",
  "completed",
  "reschedule_requested",
]);
export const visitStatusEnum = pgEnum("visit_status", [
  "scheduled",
  "completed",
  "canceled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "cancelled",
]);
export const announcementTypeEnum = pgEnum("announcement_type", [
  "hours",
  "closure",
  "program",
  "general",
]);
export const announcementStatusEnum = pgEnum("announcement_status", [
  "active",
  "inactive",
]);

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = pgTable("accounts_user", {
  id: serial("id").primaryKey(),
  password: varchar("password", { length: 128 }).notNull(),
  lastLogin: timestamp("last_login"),
  isSuperuser: boolean("is_superuser").default(false),
  username: varchar("username", { length: 150 }).unique().notNull(),
  firstName: varchar("first_name", { length: 150 }).notNull(),
  lastName: varchar("last_name", { length: 150 }).notNull(),
  isStaff: boolean("is_staff").default(false),
  isActive: boolean("is_active").default(true),
  dateJoined: timestamp("date_joined").defaultNow(),
  email: varchar("email", { length: 254 }).unique().notNull(),
  contactNumber: varchar("contact_number", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  profilePicture: varchar("profile_picture", { length: 100 }),
  role: userRoleEnum("role").notNull(),
});

// ============================================================================
// PROFILES
// ============================================================================

export const adminProfiles = pgTable("accounts_adminprofile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  title: varchar("title", { length: 100 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  status: statusEnum("status").default("active"),
});

export const doctorProfiles = pgTable("accounts_doctorprofile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  specialization: varchar("specialization", { length: 100 }).notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).unique().notNull(),
  yearsExperience: integer("years_experience").notNull(),
  medicalSchool: varchar("medical_school", { length: 100 }),
  licenseUpload: varchar("license_upload", { length: 100 }),
  biography: text("biography"),
  status: statusEnum("status").default("active"),
});

export const doctorSchedules = pgTable("accounts_doctorschedule", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id")
    .references(() => doctorProfiles.id, { onDelete: "cascade" })
    .notNull(),
  day: dayOfWeekEnum("day").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

export const staffProfiles = pgTable("accounts_staffprofile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  employeeId: varchar("employee_id", { length: 50 }).unique(),
  status: statusEnum("status").default("active"),
});

export const patientProfiles = pgTable("accounts_patientprofile", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  civilStatus: varchar("civil_status", { length: 20 }),
  address: text("address"),
  emergencyContactName: varchar("emergency_contact_name", { length: 100 }),
  emergencyContactNumber: varchar("emergency_contact_number", { length: 20 }),
  emergencyContactRelationship: varchar("emergency_contact_relationship", {
    length: 50,
  }),
  bloodType: varchar("blood_type", { length: 5 }),
  knownAllergies: text("known_allergies"),
  medicalHistory: text("medical_history"),
  guardianInfo: text("guardian_info"),
  assignedDoctorId: integer("assigned_doctor_id").references(() => users.id, {
    onDelete: "set null",
  }),
});

// ============================================================================
// APPOINTMENTS
// ============================================================================

export const appointments = pgTable(
  "appointments_appointment",
  {
    id: serial("id").primaryKey(),
    patientId: integer("patient_id")
      .references(() => patientProfiles.id, { onDelete: "cascade" })
      .notNull(),
    doctorId: integer("doctor_id")
      .references(() => doctorProfiles.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    status: appointmentStatusEnum("status").default("pending"),
    reason: text("reason"),
    rescheduleReason: text("reschedule_reason"),
    conflictingAppointmentId: integer("conflicting_appointment_id"),
    priority: integer("priority").default(0), // For tracking who requested first
    proposedDate: date("proposed_date"), // Doctor's proposed reschedule date
    proposedStartTime: time("proposed_start_time"), // Doctor's proposed reschedule time
    cancellationReason: text("cancellation_reason"), // Patient's cancellation reason
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    uniqueDoctorDateTime: unique().on(
      table.doctorId,
      table.date,
      table.startTime,
      table.endTime
    ),
  })
);

export const appointmentNotes = pgTable("appointments_appointmentnote", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id")
    .references(() => appointments.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  doctorNotes: text("doctor_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// MEDICAL RECORDS
// ============================================================================

export const patientMedicalRecords = pgTable("core_patientmedicalrecord", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  address: varchar("address", { length: 255 }),
  age: integer("age"),
  birthDate: date("birth_date"),
  contactNumber: varchar("contact_number", { length: 20 }),
  pmhx: text("pmhx"), // Past Medical History
  fmhx: text("fmhx"), // Family Medical History
  pshx: text("pshx"), // Past Surgical History
  createdAt: timestamp("created_at").defaultNow(),
});

export const visits = pgTable("core_visit", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  patientId: integer("patient_id").references(() => patientProfiles.id, {
    onDelete: "cascade",
  }),
  doctorId: integer("doctor_id").references(() => doctorProfiles.id, {
    onDelete: "set null",
  }),
  medicalRecordId: integer("medical_record_id")
    .references(() => patientMedicalRecords.id, { onDelete: "cascade" })
    .notNull(),
  attendingDoctorId: integer("attending_doctor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  date: timestamp("date").defaultNow(),
  chiefComplaint: text("chief_complaint"),
  status: visitStatusEnum("status").default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitVitals = pgTable("core_visitvitals", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  bloodPressure: varchar("blood_pressure", { length: 20 }),
  temperature: decimal("temperature", { precision: 4, scale: 2 }),
  heartRate: integer("heart_rate"),
  respiratoryRate: integer("respiratory_rate"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  oxygenSaturation: integer("oxygen_saturation"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitDiagnoses = pgTable("core_visitdiagnosis", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  diagnosisCode: varchar("diagnosis_code", { length: 50 }),
  diagnosisDescription: text("diagnosis_description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitPrescriptions = pgTable("core_visitprescription", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  medicationName: varchar("medication_name", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export const announcements = pgTable("announcements_clinicannouncement", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  announcementType:
    announcementTypeEnum("announcement_type").default("general"),
  status: announcementStatusEnum("status").default("active"),
  date: date("date"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  createdById: integer("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = pgTable("notifications_notification", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("general"),
  isRead: boolean("is_read").default(false),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// MEDICINE INVENTORY
// ============================================================================

export const medicines = pgTable(
  "medicine_inventory_pos_medicine",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    brandName: varchar("brand_name", { length: 100 }),
    genericName: varchar("generic_name", { length: 100 }),
    specification: text("specification"), // Dosage form, strength, packaging details
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stock: integer("stock").default(0).notNull(), // Total stock across all batches - Cannot be negative
    minStock: integer("min_stock").default(10), // Reorder level/alert threshold
    unit: varchar("unit", { length: 20 }).default("pcs"), // Unit of measurement (pcs, box, bottle, etc.)
    expirationDate: date("expiration_date"), // Legacy field for backward compatibility
    createdById: integer("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    stockNonNegative: check(
      "medicine_stock_non_negative",
      sql`${table.stock} >= 0`
    ),
  })
);

// Medicine Batches for FIFO inventory management
export const medicineBatches = pgTable(
  "medicine_inventory_pos_medicinebatch",
  {
    id: serial("id").primaryKey(),
    medicineId: integer("medicine_id")
      .references(() => medicines.id, { onDelete: "cascade" })
      .notNull(),
    batchNumber: varchar("batch_number", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull().default(0), // Current quantity in this batch - Cannot be negative
    originalQuantity: integer("original_quantity").notNull(), // Original quantity when stocked in
    stockInDate: timestamp("stock_in_date").defaultNow().notNull(),
    expiryDate: date("expiry_date"),
    manufactureDate: date("manufacture_date"),
    supplier: varchar("supplier", { length: 255 }),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }), // Purchase cost per unit
    status: varchar("status", { length: 20 }).default("active").notNull(), // active, expired, damaged
    notes: text("notes"),
    createdById: integer("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    quantityNonNegative: check(
      "batch_quantity_non_negative",
      sql`${table.quantity} >= 0`
    ),
  })
);

export const medicineSales = pgTable("medicine_inventory_pos_medicinesale", {
  id: serial("id").primaryKey(),
  processedById: integer("processed_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  discountType: varchar("discount_type", { length: 20 }),
  discountIdNumber: varchar("discount_id_number", { length: 100 }),
  discountPatientName: varchar("discount_patient_name", { length: 255 }),
  cash: decimal("cash", { precision: 10, scale: 2 }),
  change: decimal("change", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicineSaleItems = pgTable(
  "medicine_inventory_pos_medicinesaleitem",
  {
    id: serial("id").primaryKey(),
    saleId: integer("sale_id")
      .references(() => medicineSales.id, { onDelete: "cascade" })
      .notNull(),
    medicineId: integer("medicine_id")
      .references(() => medicines.id, { onDelete: "cascade" })
      .notNull(),
    batchId: integer("batch_id").references(() => medicineBatches.id, {
      onDelete: "set null",
    }), // Track which batch was used (optional for backward compatibility)
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  }
);

// ============================================================================
// CONSULTATION PAYMENTS
// ============================================================================

export const consultationPayments = pgTable(
  "consultation_pos_consultationpayment",
  {
    id: serial("id").primaryKey(),
    transactionId: varchar("transaction_id", { length: 50 }).unique().notNull(),
    appointmentId: integer("appointment_id")
      .references(() => appointments.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    patientId: integer("patient_id")
      .references(() => patientProfiles.id, { onDelete: "cascade" })
      .notNull(),
    doctorId: integer("doctor_id")
      .references(() => doctorProfiles.id, { onDelete: "cascade" })
      .notNull(),
    serviceId: integer("service_id").references(() => consultationServices.id, {
      onDelete: "set null",
    }),
    status: paymentStatusEnum("status").default("pending"),
    paymentMethod: varchar("payment_method", { length: 20 }),
    consultationFee: decimal("consultation_fee", {
      precision: 10,
      scale: 2,
    }).default("500"),
    tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
    change: decimal("change", { precision: 10, scale: 2 }),
    cash: decimal("cash", { precision: 10, scale: 2 }),
    discountType: varchar("discount_type", { length: 20 }),
    discountIdNumber: varchar("discount_id_number", { length: 100 }),
    discountPatientName: varchar("discount_patient_name", { length: 255 }),
    processedById: integer("processed_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    dateProcessed: timestamp("date_processed"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

// ============================================================================
// CONSULTATION SERVICES TABLE
// ============================================================================

export const consultationServices = pgTable(
  "consultation_pos_consultationservice",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

// ============================================================================
// PRESCRIPTIONS TABLES
// ============================================================================

export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "pending",
  "fulfilled",
  "cancelled",
]);

export const prescriptions = pgTable("core_prescription", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id")
    .references(() => visits.id, { onDelete: "cascade" })
    .notNull(),
  patientId: integer("patient_id")
    .references(() => patientProfiles.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: integer("doctor_id").references(() => doctorProfiles.id, {
    onDelete: "set null",
  }),
  status: prescriptionStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  fulfilledAt: timestamp("fulfilled_at"),
  fulfilledById: integer("fulfilled_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const prescriptionItems = pgTable("core_prescription_item", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id")
    .references(() => prescriptions.id, { onDelete: "cascade" })
    .notNull(),

  // Medicine reference - nullable for external medicines
  medicineId: integer("medicine_id").references(() => medicines.id, {
    onDelete: "set null",
  }), // Changed to nullable

  // Free-text medicine name for external/non-inventory medicines
  medicineName: varchar("medicine_name", { length: 255 }),

  // Flag to indicate if this is an external medicine (not in clinic inventory)
  isExternal: boolean("is_external").default(false).notNull(),

  quantity: integer("quantity").notNull(),
  dosage: varchar("dosage", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  instructions: text("instructions"),
  isAvailable: boolean("is_available").default(true).notNull(),
});

// ============================================================================
// RELATIONS (for Drizzle ORM queries)
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  adminProfile: one(adminProfiles, {
    fields: [users.id],
    references: [adminProfiles.userId],
  }),
  doctorProfile: one(doctorProfiles, {
    fields: [users.id],
    references: [doctorProfiles.userId],
  }),
  staffProfile: one(staffProfiles, {
    fields: [users.id],
    references: [staffProfiles.userId],
  }),
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  notifications: many(notifications),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patientProfiles, {
    fields: [appointments.patientId],
    references: [patientProfiles.id],
  }),
  doctor: one(doctorProfiles, {
    fields: [appointments.doctorId],
    references: [doctorProfiles.id],
  }),
  note: one(appointmentNotes, {
    fields: [appointments.id],
    references: [appointmentNotes.appointmentId],
  }),
}));

export const prescriptionsRelations = relations(
  prescriptions,
  ({ one, many }) => ({
    visit: one(visits, {
      fields: [prescriptions.visitId],
      references: [visits.id],
    }),
    patient: one(patientProfiles, {
      fields: [prescriptions.patientId],
      references: [patientProfiles.id],
    }),
    doctor: one(doctorProfiles, {
      fields: [prescriptions.doctorId],
      references: [doctorProfiles.id],
    }),
    items: many(prescriptionItems),
  })
);

export const prescriptionItemsRelations = relations(
  prescriptionItems,
  ({ one }) => ({
    prescription: one(prescriptions, {
      fields: [prescriptionItems.prescriptionId],
      references: [prescriptions.id],
    }),
    medicine: one(medicines, {
      fields: [prescriptionItems.medicineId],
      references: [medicines.id],
    }),
  })
);
