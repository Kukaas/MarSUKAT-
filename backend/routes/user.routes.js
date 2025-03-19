import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  getAllJobOrders,
  getJobOrderById,
  createJobOrder,
  updateJobOrder,
  deleteJobOrder,
  activateJobOrder,
  deactivateJobOrder,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/user.controller.js";
import { isSuperAdmin } from "../middleware/superadmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/:userId/profile", authenticateUser, getProfile);
router.put("/:userId/profile", authenticateUser, updateProfile);

// Admin routes
router.get("/", authenticateUser, isSuperAdmin, getAllUsers);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteUser);

// Job Order routes
router.get("/job-orders", authenticateUser, isSuperAdmin, getAllJobOrders);
router.get("/job-orders/:id", authenticateUser, isSuperAdmin, getJobOrderById);
router.post("/job-orders", authenticateUser, isSuperAdmin, createJobOrder);
router.put("/job-orders/:id", authenticateUser, isSuperAdmin, updateJobOrder);
router.delete(
  "/job-orders/:id",
  authenticateUser,
  isSuperAdmin,
  deleteJobOrder
);
router.put(
  "/job-orders/:id/activate",
  authenticateUser,
  isSuperAdmin,
  activateJobOrder
);
router.put(
  "/job-orders/:id/deactivate",
  authenticateUser,
  isSuperAdmin,
  deactivateJobOrder
);

// Add these routes after your existing routes
router.get("/notifications", authenticateUser, getUserNotifications);
router.put("/notifications/:notificationId/read", authenticateUser, markNotificationAsRead);
router.put("/notifications/read-all", authenticateUser, markAllNotificationsAsRead);

export default router;
