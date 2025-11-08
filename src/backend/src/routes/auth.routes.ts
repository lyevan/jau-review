import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users, patientProfiles } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/auth/signin
router.post("/signin", async (req, res) => {
  try {
    const { email_address, password } = req.body;

    console.log("📧 Login attempt:", email_address);

    if (!email_address || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({
        status: false,
        result: null,
        error: "Email and password are required",
      });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email_address));

    if (!user) {
      console.log("❌ User not found:", email_address);
      return res.status(401).json({
        status: false,
        result: null,
        error: "Invalid credentials",
      });
    }

    console.log("✅ User found:", user.email, "| Role:", user.role);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log("🔐 Password valid:", isValidPassword);

    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email_address);
      return res.status(401).json({
        status: false,
        result: null,
        error: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Account is inactive",
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        type: "acc",
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        username: user.username,
        contact_number: user.contactNumber,
        date_of_birth: user.dateOfBirth,
        gender: user.gender,
        profile_picture: user.profilePicture,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1h" }
    );

    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || "30d",
    });

    res.json({
      status: true,
      result: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      error: null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "An error occurred during login",
    });
  }
});

// POST /api/auth/session_check
router.get("/session_check", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ status: false });
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      res.json({ status: true });
    } catch {
      res.status(401).json({ status: false });
    }
  } catch (error) {
    res.status(500).json({ status: false });
  }
});

// POST /api/auth/session_refresh
router.post("/session_refresh", async (req, res) => {
  try {
    const refreshToken = req.headers["x-refresh-token"] as string;

    if (!refreshToken) {
      return res.status(401).json({
        status: false,
        result: null,
        error: "Refresh token required",
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
        id: number;
      };

      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id));

      if (!user || !user.isActive) {
        return res.status(401).json({
          status: false,
          result: null,
          error: "Invalid session",
        });
      }

      // Generate new tokens
      const accessToken = jwt.sign(
        {
          id: user.id,
          type: "acc",
          role: user.role,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          username: user.username,
          contact_number: user.contactNumber,
          date_of_birth: user.dateOfBirth,
          gender: user.gender,
          profile_picture: user.profilePicture,
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1h" }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "30d" }
      );

      res.json({
        status: true,
        result: {
          new_auth: {
            access_token: accessToken,
            refresh_token: newRefreshToken,
          },
        },
        error: null,
      });
    } catch {
      res.status(401).json({
        status: false,
        result: null,
        error: "Invalid refresh token",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      result: null,
      error: "An error occurred",
    });
  }
});

// POST /api/auth/register - Register new patient
router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      contact_number,
      address,
      date_of_birth,
      gender,
    } = req.body;

    console.log("📝 Registration attempt:", email);

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Full name, email, and password are required",
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
        error: "Email already registered",
      });
    }

    // Split full name into first and last name
    const nameParts = full_name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || nameParts[0];

    // Generate username from email
    const username = email.split("@")[0];

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        contactNumber: contact_number || null,
        dateOfBirth: date_of_birth || null,
        gender: gender?.toLowerCase() || null,
        role: "patient",
        isActive: true,
      })
      .returning();

    console.log("✅ User created:", newUser.id);

    // Create patient profile - ensure it's created before responding
    try {
      const [newPatientProfile] = await db
        .insert(patientProfiles)
        .values({
          userId: newUser.id,
          address: address || null,
          emergencyContactName: null,
          emergencyContactNumber: contact_number || null,
        })
        .returning();

      console.log("✅ Patient profile created:", newPatientProfile.id);
    } catch (profileError) {
      console.error("❌ Failed to create patient profile:", profileError);
      // Rollback user creation if profile creation fails
      await db.delete(users).where(eq(users.id, newUser.id));
      throw new Error("Failed to create patient profile");
    }

    res.status(201).json({
      status: true,
      result: {
        message: "Registration successful",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
      error: null,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Registration failed",
    });
  }
});

export default router;
