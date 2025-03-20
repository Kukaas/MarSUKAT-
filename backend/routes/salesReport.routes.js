import express from "express";
import {
  createSalesReport,
  getAllSalesReports,
  getSalesReportById,
  getMonthlySalesSummary,
  getYearlySalesSummary,
} from "../controllers/salesReport.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";

const router = express.Router();

// All routes require authentication and JobOrder role
router.use(authenticateUser, isJobOrder);

// Create sales report from claimed order
router.post("/", createSalesReport);

// Get all sales reports
router.get("/", getAllSalesReports);

// Get sales report by ID
router.get("/:id", getSalesReportById);

// Get monthly sales summary
router.get("/summary/monthly", getMonthlySalesSummary);

// Get yearly sales summary
router.get("/summary/yearly", getYearlySalesSummary);

export default router; 