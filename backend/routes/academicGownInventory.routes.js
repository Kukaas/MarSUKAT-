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
router.post("/", authenticateUser, isJobOrder, createAcademicGownInventory);
router.put("/:id", authenticateUser, isJobOrder, updateAcademicGownInventory);
router.delete("/:id", authenticateUser, isJobOrder, deleteAcademicGownInventory);
router.patch("/:id/quantity", authenticateUser, isJobOrder, updateInventoryQuantity);

export default router; 