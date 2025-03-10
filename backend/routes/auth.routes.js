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
// Add verification route
router.get("/verify/:userId/:uniqueString", verifyEmail);
// Login route
router.post("/login", login);
// Logout route (requires authentication)
router.post("/logout", authenticateUser, logout);

export default router;
