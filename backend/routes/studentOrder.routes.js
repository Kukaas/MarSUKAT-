import express from "express";
import {
  getAllStudentOrders,
  getStudentOrderById,
  createStudentOrder,
  updateStudentOrder,
  deleteStudentOrder,
} from "../controllers/studentOrder.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { isStudent } from "../middleware/student.middleware.js";

const router = express.Router();

// Student routes
router.post("/", authenticateUser, isStudent, createStudentOrder);
router.get("/my-orders", authenticateUser, isStudent, getAllStudentOrders);
router.get("/:id", authenticateUser, isStudent, getStudentOrderById);

// Admin routes
router.put("/:id", authenticateUser, updateStudentOrder);
router.delete("/:id", authenticateUser, deleteStudentOrder);

export default router;
