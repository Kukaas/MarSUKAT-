import express from "express";
import {
  signup,
  verifyEmail,
  login,
  logout,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Signup route
router.post("/signup", signup);

// Verification routes - handle both GET and POST for better UX
router.get("/verify/:userId/:uniqueString", verifyEmail);
router.post("/verify/:userId/:uniqueString", verifyEmail); // Handle form submissions if needed

// Login route
router.post("/login", login);

// Logout route (requires authentication)
router.post("/logout", authenticateUser, logout);

export default router;
