import express from "express";
import {
  requestOTP,
  verifyOTPAndChangePassword,
} from "../controllers/otp.controller.js";

const router = express.Router();

// Route to request OTP for password change
router.post("/request", requestOTP);

// Route to verify OTP and change password
router.post("/verify", verifyOTPAndChangePassword);

export default router;
