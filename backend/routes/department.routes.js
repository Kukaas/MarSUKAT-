import express from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { isSuperAdmin } from "../middleware/superadmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createDepartment);
router.put("/:id", authenticateUser, isSuperAdmin, updateDepartment);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteDepartment);

export default router;
