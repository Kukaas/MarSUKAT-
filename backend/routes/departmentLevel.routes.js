import express from "express";
import {
  createDepartmentLevel,
  getAllDepartmentLevels,
  getActiveDepartmentLevels,
  updateDepartmentLevelStatus,
  deleteDepartmentLevel,
  updateDepartmentLevel,
} from "../controllers/departmentLevel.controller.js";

const router = express.Router();

// Create a new department-level combination
router.post("/", createDepartmentLevel);

// Get all department-level combinations
router.get("/", getAllDepartmentLevels);

// Get active department-level combinations
router.get("/active", getActiveDepartmentLevels);

// Update department-level combination
router.put("/:id", updateDepartmentLevel);

// Update department-level combination status
router.patch("/:id", updateDepartmentLevelStatus);

// Delete department-level combination
router.delete("/:id", deleteDepartmentLevel);

export default router;
