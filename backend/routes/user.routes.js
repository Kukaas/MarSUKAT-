import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  getAllStaffUsers,
  getStaffUserById,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  activateStaffUser,
  deactivateStaffUser,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  verifyStudent,
  activateStudent,
  deactivateStudent,
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

// Staff User routes (JobOrder and BAO)
router.get("/staff", authenticateUser, isSuperAdmin, getAllStaffUsers);
router.get("/staff/:id", authenticateUser, isSuperAdmin, getStaffUserById);
router.post("/staff", authenticateUser, isSuperAdmin, createStaffUser);
router.put("/staff/:id", authenticateUser, isSuperAdmin, updateStaffUser);
router.delete("/staff/:id", authenticateUser, isSuperAdmin, deleteStaffUser);
router.put("/staff/:id/activate", authenticateUser, isSuperAdmin, activateStaffUser);
router.put("/staff/:id/deactivate", authenticateUser, isSuperAdmin, deactivateStaffUser);

// Notification routes
router.get("/notifications", authenticateUser, getUserNotifications);
router.put("/notifications/:notificationId/read", authenticateUser, markNotificationAsRead);
router.put("/notifications/read-all", authenticateUser, markAllNotificationsAsRead);

// Student User Management Routes
router.get("/students", authenticateUser, isSuperAdmin, getAllStudents);
router.get("/students/:id", authenticateUser, isSuperAdmin, getStudentById);
router.put("/students/:id", authenticateUser, isSuperAdmin, updateStudent);
router.delete("/students/:id", authenticateUser, isSuperAdmin, deleteStudent);
router.put("/students/:id/verify", authenticateUser, isSuperAdmin, verifyStudent);
router.put("/students/:id/activate", authenticateUser, isSuperAdmin, activateStudent);
router.put("/students/:id/deactivate", authenticateUser, isSuperAdmin, deactivateStudent);

export default router;
