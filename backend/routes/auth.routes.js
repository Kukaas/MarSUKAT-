import express from "express";
import {
  signup,
  verifyEmail,
  login,
  logout,
  getMe,
  changePassword,
  resendVerification,
} from "../controllers/auth.controller.js";
import {
  authenticateUser,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/resend-verification", resendVerification);

// Verification routes
router.get("/verify/:userId/:uniqueString", verifyEmail);
router.post("/verify/:userId/:uniqueString", verifyEmail);

// Protected routes (require authentication)
router.get("/me", authenticateUser, getMe);
router.post("/logout", authenticateUser, logout);


router.put("/change-password", authenticateUser, changePassword);

export default router;
