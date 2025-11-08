import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import medicalRecordRoutes from "./routes/medical-record.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import visitRoutes from "./routes/visit.routes.js";

dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Rate Limiting

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/visits", visitRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "JAU Clinic API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/api`);
});

export default app;
