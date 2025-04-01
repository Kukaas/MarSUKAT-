import express from "express";
import {
  createAccomplishmentReport,
  getAllAccomplishmentReports,
  getAccomplishmentReportById,
  updateAccomplishmentReport,
  deleteAccomplishmentReport,
} from "../controllers/accomplishmentReport.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateUser, getAllAccomplishmentReports);
router.get("/:id", authenticateUser, getAccomplishmentReportById);
router.post("/", authenticateUser, createAccomplishmentReport);
router.put("/:id", authenticateUser, updateAccomplishmentReport);
router.delete("/:id", authenticateUser, deleteAccomplishmentReport);

export default router; 