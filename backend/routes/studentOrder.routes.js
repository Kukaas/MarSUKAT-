import express from "express";
import {
  getAllStudentOrders,
  getStudentOrderById,
  createStudentOrder,
  updateStudentOrder,
  deleteStudentOrder,
  getOrdersByUserId,
} from "../controllers/studentOrder.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { isStudent } from "../middleware/student.middleware.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";

const router = express.Router();

router.get("/", authenticateUser, isJobOrder, getAllStudentOrders);

// Student routes
router.post("/", authenticateUser, isStudent, createStudentOrder);
router.get("/:id", authenticateUser, isStudent, getStudentOrderById);

// Admin routes
router.put("/:id", authenticateUser, updateStudentOrder);
router.delete("/:id", authenticateUser, deleteStudentOrder);

// Add this new route
router.get("/user/:userId", authenticateUser, isStudent, getOrdersByUserId);

export default router;
