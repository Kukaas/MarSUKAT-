import express from "express";
import {
  createRawMaterialType,
  getAllRawMaterialTypes,
  getRawMaterialTypeById,
  updateRawMaterialType,
  deleteRawMaterialType,
  getRawMaterialTypesByCategory,
} from "../controllers/rawMaterialType.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllRawMaterialTypes);
router.get("/category/:category", getRawMaterialTypesByCategory);
router.get("/:id", getRawMaterialTypeById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createRawMaterialType);
router.put("/:id", authenticateUser, isSuperAdmin, updateRawMaterialType);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteRawMaterialType);

export default router;
