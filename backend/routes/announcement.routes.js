import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getCurrentAnnouncements,
} from "../controllers/announcement.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllAnnouncements);
router.get("/current", getCurrentAnnouncements);
router.get("/:id", getAnnouncementById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createAnnouncement);
router.put("/:id", authenticateUser, isSuperAdmin, updateAnnouncement);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteAnnouncement);

export default router;
