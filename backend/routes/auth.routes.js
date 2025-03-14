import express from "express";
import {
  signup,
  verifyEmail,
  login,
  logout,
  getMe,
  refreshToken,
  changePassword,
} from "../controllers/auth.controller.js";
import {
  authenticateUser,
  verifyRefreshToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Verification routes
router.get("/verify/:userId/:uniqueString", verifyEmail);
router.post("/verify/:userId/:uniqueString", verifyEmail);

// Protected routes (require authentication)
router.get("/me", authenticateUser, getMe);
router.post("/logout", authenticateUser, logout);

// Token refresh route (requires refresh token)
router.post("/refresh-token", verifyRefreshToken, refreshToken);

router.put("/change-password", authenticateUser, changePassword);

export default router;
