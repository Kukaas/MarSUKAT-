import express from "express";
import {
  getAllAcademicGownInventory,
  getAcademicGownInventoryById,
  createAcademicGownInventory,
  updateAcademicGownInventory,
  deleteAcademicGownInventory,
  getInventoryStats,
  updateInventoryQuantity
} from "../controllers/academicGownInventory.controller.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllAcademicGownInventory);
router.get("/stats", getInventoryStats);
router.get("/:id", getAcademicGownInventoryById);

// Job Order only routes
router.post("/", authenticateUser, createAcademicGownInventory);
router.put("/:id", authenticateUser, updateAcademicGownInventory);
router.delete("/:id", authenticateUser, deleteAcademicGownInventory);
router.patch("/:id/quantity", authenticateUser, updateInventoryQuantity);

export default router; 