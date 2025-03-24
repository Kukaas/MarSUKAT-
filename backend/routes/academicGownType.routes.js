import express from "express";
import {
  getAllAcademicGownTypes,
  getAcademicGownTypeById,
  createAcademicGownType,
  updateAcademicGownType,
  deleteAcademicGownType,
} from "../controllers/academicGownType.controller.js";
import { isSuperAdmin } from "../middleware/superadmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllAcademicGownTypes);
router.get("/:id", getAcademicGownTypeById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createAcademicGownType);
router.put("/:id", authenticateUser, isSuperAdmin, updateAcademicGownType);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteAcademicGownType);

export default router; 