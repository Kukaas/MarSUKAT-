import express from "express";
import {
  getDashboardOverview
} from "../controllers/dashboard.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";

const router = express.Router();

// Protected routes - requires JobOrder role
router.get("/overview", authenticateUser, getDashboardOverview);

export default router; 