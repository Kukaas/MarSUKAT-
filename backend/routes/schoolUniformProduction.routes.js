import express from "express";
import {
  getAllSchoolUniformProductions,
  getSchoolUniformProductionById,
  createSchoolUniformProduction,
  updateSchoolUniformProduction,
  deleteSchoolUniformProduction,
} from "../controllers/schoolUniformProduction.controller.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllSchoolUniformProductions);
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
