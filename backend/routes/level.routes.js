import express from "express";
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
} from "../controllers/level.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllLevels);
router.get("/:id", getLevelById);

// Super Admin only routes
router.post("/", auth, isSuperAdmin, createLevel);
router.put("/:id", auth, isSuperAdmin, updateLevel);
router.delete("/:id", auth, isSuperAdmin, deleteLevel);

export default router;
