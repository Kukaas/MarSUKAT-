import express from "express";
import {
  getAllAcademicGownProductions,
  getAcademicGownProductionById,
  createAcademicGownProduction,
  updateAcademicGownProduction,
  deleteAcademicGownProduction,
  getProductionStats,
  getRawMaterialsUsageStats,
  getMaterialUsageReport
} from "../controllers/academicGownProduction.controller.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllAcademicGownProductions);
router.get("/stats", getProductionStats);
router.get("/raw-materials-usage", getRawMaterialsUsageStats);
router.get("/material-usage-report", getMaterialUsageReport);
router.get("/:id", getAcademicGownProductionById);

// Job Order only routes
router.post("/", authenticateUser, isJobOrder, createAcademicGownProduction);
router.put("/:id", authenticateUser, isJobOrder, updateAcademicGownProduction);
router.delete(
  "/:id",
  authenticateUser,
  isJobOrder,
  deleteAcademicGownProduction
);

export default router; 