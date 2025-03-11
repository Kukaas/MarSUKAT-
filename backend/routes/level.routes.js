import express from "express";
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
} from "../controllers/level.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllLevels);
router.get("/:id", getLevelById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createLevel);
router.put("/:id", authenticateUser, isSuperAdmin, updateLevel);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteLevel);

export default router;
