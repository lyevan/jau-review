import { Router } from "express";
import { db } from "../db/index.js";
import { announcements, users } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/announcements - Get all announcements
router.get("/", async (req, res) => {
  try {
    const allAnnouncements = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        announcementType: announcements.announcementType,
        status: announcements.status,
        date: announcements.date,
        startTime: announcements.startTime,
        endTime: announcements.endTime,
        createdAt: announcements.createdAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdById, users.id))
      .orderBy(desc(announcements.createdAt));

    console.log(`✅ Found ${allAnnouncements.length} announcements`);

    res.json({
      status: true,
      result: allAnnouncements,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching announcements:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch announcements",
    });
  }
});

// GET /api/announcements/:id - Get single announcement
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [announcement] = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        announcementType: announcements.announcementType,
        status: announcements.status,
        date: announcements.date,
        startTime: announcements.startTime,
        endTime: announcements.endTime,
        createdAt: announcements.createdAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdById, users.id))
      .where(eq(announcements.id, parseInt(id)));

    if (!announcement) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Announcement not found",
      });
    }

    res.json({
      status: true,
      result: announcement,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error fetching announcement:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to fetch announcement",
    });
  }
});

// POST /api/announcements - Create announcement (admin only)
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only admin can create announcements
    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Only admins can create announcements",
      });
    }

    const {
      title,
      content,
      announcementType,
      status,
      date,
      startTime,
      endTime,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        status: false,
        result: null,
        error: "Title and content are required",
      });
    }

    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title,
        content,
        announcementType: announcementType || "general",
        status: status || "active",
        date: date || null,
        startTime: startTime || null,
        endTime: endTime || null,
        createdById: userId,
      })
      .returning();

    console.log("✅ Created announcement:", newAnnouncement.id);

    // Fetch with creator details
    const [createdAnnouncement] = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        announcementType: announcements.announcementType,
        status: announcements.status,
        date: announcements.date,
        startTime: announcements.startTime,
        endTime: announcements.endTime,
        createdAt: announcements.createdAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdById, users.id))
      .where(eq(announcements.id, newAnnouncement.id));

    res.status(201).json({
      status: true,
      result: createdAnnouncement,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error creating announcement:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to create announcement",
    });
  }
});

// PUT /api/announcements/:id - Update announcement (admin only)
router.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Only admins can update announcements",
      });
    }

    const { id } = req.params;
    const {
      title,
      content,
      announcementType,
      status,
      date,
      startTime,
      endTime,
    } = req.body;

    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({
        title,
        content,
        announcementType,
        status,
        date: date || null,
        startTime: startTime || null,
        endTime: endTime || null,
      })
      .where(eq(announcements.id, parseInt(id)))
      .returning();

    if (!updatedAnnouncement) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Announcement not found",
      });
    }

    console.log("✅ Updated announcement:", updatedAnnouncement.id);

    // Fetch with creator details
    const [announcement] = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        announcementType: announcements.announcementType,
        status: announcements.status,
        date: announcements.date,
        startTime: announcements.startTime,
        endTime: announcements.endTime,
        createdAt: announcements.createdAt,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdById, users.id))
      .where(eq(announcements.id, updatedAnnouncement.id));

    res.json({
      status: true,
      result: announcement,
      error: null,
    });
  } catch (error) {
    console.error("❌ Error updating announcement:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to update announcement",
    });
  }
});

// DELETE /api/announcements/:id - Delete announcement (admin only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        status: false,
        result: null,
        error: "Only admins can delete announcements",
      });
    }

    const { id } = req.params;

    const [deletedAnnouncement] = await db
      .delete(announcements)
      .where(eq(announcements.id, parseInt(id)))
      .returning();

    if (!deletedAnnouncement) {
      return res.status(404).json({
        status: false,
        result: null,
        error: "Announcement not found",
      });
    }

    console.log("✅ Deleted announcement:", deletedAnnouncement.id);

    res.json({
      status: true,
      result: { id: deletedAnnouncement.id },
      error: null,
    });
  } catch (error) {
    console.error("❌ Error deleting announcement:", error);
    res.status(500).json({
      status: false,
      result: null,
      error: "Failed to delete announcement",
    });
  }
});

export default router;
