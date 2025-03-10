import express from "express";
import { signup, verifyEmail } from "../controllers/auth.controller.js";

const router = express.Router();

// Signup route
router.post("/signup", signup);
// Add verification route
router.get("/verify/:userId/:uniqueString", verifyEmail);

export default router;
