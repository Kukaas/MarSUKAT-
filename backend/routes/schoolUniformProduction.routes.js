import express from "express";
import {
  getAllSchoolUniformProductions,
  getSchoolUniformProductionById,
  createSchoolUniformProduction,
  updateSchoolUniformProduction,
  deleteSchoolUniformProduction,
  getProductionStats,
  getRawMaterialsUsageStats,
  getMaterialUsageReport
} from "../controllers/schoolUniformProduction.controller.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllSchoolUniformProductions);
router.get("/stats", getProductionStats);
router.get("/raw-materials-usage", getRawMaterialsUsageStats);
router.get("/material-usage-report", getMaterialUsageReport);
router.get("/:id", getSchoolUniformProductionById);

// Job Order only routes
router.post("/", authenticateUser, isJobOrder, createSchoolUniformProduction);
router.put("/:id", authenticateUser, isJobOrder, updateSchoolUniformProduction);
router.delete(
  "/:id",
  authenticateUser,
  isJobOrder,
  deleteSchoolUniformProduction
);

export default router;
