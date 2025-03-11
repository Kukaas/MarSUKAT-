import express from "express";
import {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
} from "../controllers/unit.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllUnits);
router.get("/:id", getUnitById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createUnit);
router.put("/:id", authenticateUser, isSuperAdmin, updateUnit);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteUnit);

export default router;
