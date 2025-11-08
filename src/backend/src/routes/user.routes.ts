import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db/index.js";
import {
  users,
  patientProfiles,
  doctorProfiles,
  staffProfiles,
  adminProfiles,
  patientMedicalRecords,
  visits,
  visitVitals,
  visitDiagnoses,
} from "../db/schema.js";
import { eq, or, ilike, sql, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";
import bcryptjs from "bcryptjs";

const router = Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/profile-pictures");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// GET /api/users - Get all users (Admin/Staff only)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin and staff can view all users
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const { role, search, status, access } = req.query;

    console.log("📊 Query params:", { role, search, status, access });
    console.log("📊 Access type:", typeof access, "Value:", access);

    // Build base query without complex WHERE clauses first
    let whereClause = sql`1=1`;

    // Handle access parameter (maps to role)
    if (access) {
      const accessMap: Record<string, string> = {
        "1": "admin",
        "2": "patient",
        "3": "doctor",
        "4": "staff",
      };
      const mappedRole = accessMap[access as string];
      console.log("✅ Mapping access", access, "to role:", mappedRole);
      if (mappedRole) {
        whereClause = sql`${whereClause} AND ${users.role} = ${mappedRole}`;
      }
    } else if (role && role !== "all") {
      whereClause = sql`${whereClause} AND ${users.role} = ${role}`;
    }

    if (status === "active") {
      whereClause = sql`${whereClause} AND ${users.isActive} = true`;
    } else if (status === "inactive") {
      whereClause = sql`${whereClause} AND ${users.isActive} = false`;
    }

    if (search && typeof search === "string") {
      whereClause = sql`${whereClause} AND (
        ${users.firstName} ILIKE ${"%" + search + "%"} OR
        ${users.lastName} ILIKE ${"%" + search + "%"} OR
        ${users.email} ILIKE ${"%" + search + "%"} OR
        ${users.username} ILIKE ${"%" + search + "%"}
      )`;
    }

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        first_name: users.firstName,
        last_name: users.lastName,
        contact_number: users.contactNumber,
        date_of_birth: users.dateOfBirth,
        gender: users.gender,
        role: users.role,
        is_active: users.isActive,
        created_at: users.dateJoined,
        // Calculate age from date_of_birth
        age: sql<number>`CASE 
          WHEN ${users.dateOfBirth} IS NOT NULL 
          THEN EXTRACT(YEAR FROM AGE(${users.dateOfBirth}))::int
          ELSE NULL 
        END`,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.dateJoined));

    console.log(`✅ Found ${allUsers.length} users`);

    res.json({
      status: true,
      result: allUsers,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch users",
    });
  }
});

// GET /api/users/:id - Get user by ID (Admin only)
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const userId = parseInt(req.params.id);

    // Only admin and staff can view user details
    if (userRole !== "admin" && userRole !== "staff") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin or staff access required.",
      });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "User not found",
      });
    }

    // Get profile based on role
    let profile = null;
    let medicalRecord = null;
    let visitHistory: any[] = [];

    if (user.role === "patient") {
      // Get patient profile
      [profile] = await db
        .select()
        .from(patientProfiles)
        .where(eq(patientProfiles.userId, userId));

      // Get medical records
      [medicalRecord] = await db
        .select()
        .from(patientMedicalRecords)
        .where(eq(patientMedicalRecords.patientId, userId));

      // Get visit history with vitals and diagnoses
      if (medicalRecord) {
        const patientVisits = await db
          .select({
            id: visits.id,
            date: visits.date,
            chiefComplaint: visits.chiefComplaint,
            status: visits.status,
            attendingDoctorId: visits.attendingDoctorId,
          })
          .from(visits)
          .where(eq(visits.medicalRecordId, medicalRecord.id))
          .orderBy(desc(visits.date));

        // For each visit, get vitals and diagnoses
        for (const visit of patientVisits) {
          const [vitals] = await db
            .select()
            .from(visitVitals)
            .where(eq(visitVitals.visitId, visit.id));

          const diagnoses = await db
            .select()
            .from(visitDiagnoses)
            .where(eq(visitDiagnoses.visitId, visit.id));

          visitHistory.push({
            ...visit,
            vitals: vitals || null,
            diagnoses: diagnoses || [],
          });
        }
      }
    } else if (user.role === "doctor") {
      [profile] = await db
        .select()
        .from(doctorProfiles)
        .where(eq(doctorProfiles.userId, userId));
    } else if (user.role === "staff") {
      [profile] = await db
        .select()
        .from(staffProfiles)
        .where(eq(staffProfiles.userId, userId));
    } else if (user.role === "admin") {
      [profile] = await db
        .select()
        .from(adminProfiles)
        .where(eq(adminProfiles.userId, userId));
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Calculate age if date of birth exists
    const age = user.dateOfBirth
      ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()
      : null;

    res.json({
      status: true,
      result: {
        ...userWithoutPassword,
        age,
        profile,
        medicalRecord,
        visits: visitHistory,
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch user",
    });
  }
});

// POST /api/users - Create new user (Admin only)
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    // Only admin can create users
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin access required.",
      });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      contactNumber,
      dateOfBirth,
      gender,
      role,
      profileData,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Missing required fields",
      });
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username: username || email.split("@")[0],
        email,
        password: hashedPassword,
        firstName,
        lastName,
        contactNumber: contactNumber || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        role,
        isActive: true,
      })
      .returning();

    // Create corresponding profile
    if (role === "patient" && profileData) {
      await db.insert(patientProfiles).values({
        userId: newUser.id,
        civilStatus: profileData.civilStatus || null,
        address: profileData.address || null,
        emergencyContactName: profileData.emergencyContactName || null,
        emergencyContactNumber: profileData.emergencyContactNumber || null,
        emergencyContactRelationship:
          profileData.emergencyContactRelationship || null,
      });
    } else if (role === "doctor" && profileData) {
      await db.insert(doctorProfiles).values({
        userId: newUser.id,
        specialization: profileData.specialization || null,
        licenseNumber: profileData.licenseNumber || null,
      });
    } else if (role === "staff" && profileData) {
      await db.insert(staffProfiles).values({
        userId: newUser.id,
        position: profileData.position || null,
        department: profileData.department || null,
      });
    } else if (role === "admin") {
      await db.insert(adminProfiles).values({
        userId: newUser.id,
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: true,
      result: userWithoutPassword,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create user",
    });
  }
});

// PATCH /api/users/:id - Update user (Admin only)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const userId = parseInt(req.params.id);

    // Only admin can update users
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin access required.",
      });
    }

    const updateData = req.body;

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "User not found",
      });
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, 10);
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      status: true,
      result: userWithoutPassword,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to update user",
    });
  }
});

// DELETE /api/users/:id - Delete/Deactivate user (Admin only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;
    const userId = parseInt(req.params.id);

    // Only admin can delete users
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Access denied. Admin access required.",
      });
    }

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "User not found",
      });
    }

    // Soft delete - just deactivate the user
    await db.update(users).set({ isActive: false }).where(eq(users.id, userId));

    res.json({
      status: true,
      result: { message: "User deactivated successfully" },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to delete user",
    });
  }
});

// PUT /api/users/profile - Update own profile
router.put(
  "/profile",
  authenticateToken,
  upload.single("profilePicture"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, email, phone, dateOfBirth, gender } =
        req.body;

      // Prepare update data
      const updateData: any = {
        firstName,
        lastName,
        email,
        contactNumber: phone,
      };

      // Add optional fields if provided
      if (dateOfBirth) {
        updateData.dateOfBirth = dateOfBirth;
      }

      if (gender) {
        updateData.gender = gender;
      }

      // Add profile picture if uploaded
      if (req.file) {
        updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      }

      // Update user data
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "User not found",
        });
      }

      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        status: true,
        result: userWithoutPassword,
        user: userWithoutPassword,
        error: null,
      });
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to update profile",
      });
    }
  }
);

// PUT /api/users/change-password - Change own password
router.put(
  "/change-password",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: false,
          result: null,
          error: "Current password and new password are required",
        });
      }

      // Get current user
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({
          status: false,
          result: null,
          error: "User not found",
        });
      }

      // Verify current password
      const isPasswordValid = await bcryptjs.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          status: false,
          result: null,
          error: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
        })
        .where(eq(users.id, userId));

      res.json({
        status: true,
        result: { message: "Password changed successfully" },
        error: null,
      });
    } catch (error) {
      console.error("❌ Error changing password:", error);
      res.status(500).json({
        status: false,
        result: null,
        error: "Failed to change password",
      });
    }
  }
);

export default router;
