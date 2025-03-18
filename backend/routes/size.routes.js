import express from "express";
import {
  createSize,
  getAllSizes,
  getSizeById,
  updateSize,
  deleteSize,
} from "../controllers/size.controller.js";
import { isSuperAdmin } from "../middleware/superadmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllSizes);
router.get("/:id", getSizeById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createSize);
router.put("/:id", authenticateUser, isSuperAdmin, updateSize);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteSize);

export default router;
