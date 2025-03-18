import express from "express";
import {
  getAllStudentOrders,
  getStudentOrderById,
  createStudentOrder,
  updateStudentOrder,
  deleteStudentOrder,
  getOrdersByUserId,
  rejectOrder,
  getAllSchedules,
  getMySchedule,
  addOrderItemsAndMeasure,
  verifyReceipt,
} from "../controllers/studentOrder.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { isStudent } from "../middleware/student.middleware.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";

const router = express.Router();

// Move specific routes before parameterized routes to avoid conflicts
// Schedule routes should be before /:id route
router.get("/schedules/all", authenticateUser, isJobOrder, getAllSchedules);
router.get(
  "/schedules/user/:userId",
  authenticateUser,
  isStudent,
  getMySchedule
);

router.get("/", authenticateUser, isJobOrder, getAllStudentOrders);
router.get("/user/:userId", authenticateUser, isStudent, getOrdersByUserId);

// Student routes
router.post("/", authenticateUser, isStudent, createStudentOrder);
router.get("/:id", authenticateUser, isStudent, getStudentOrderById);

// Admin routes
router.put("/:id", authenticateUser, updateStudentOrder);
router.delete("/:id", authenticateUser, deleteStudentOrder);
router.put("/:id/reject", authenticateUser, isJobOrder, rejectOrder);
router.put(
  "/:id/measure",
  authenticateUser,
  isJobOrder,
  addOrderItemsAndMeasure
);
router.put("/:id/verify-receipt", authenticateUser, isJobOrder, verifyReceipt);

export default router;
