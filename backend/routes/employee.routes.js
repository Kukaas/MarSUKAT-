import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getActiveEmployees,
} from "../controllers/employee.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticateUser);

// Employee routes
router.get("/", getAllEmployees);
router.get("/active", getActiveEmployees);
router.get("/:id", getEmployeeById);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.patch("/:id/status", updateEmployeeStatus);
router.delete("/:id", deleteEmployee);

export default router; 