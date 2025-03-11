import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "../utils/emailService.js";

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP for password change
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Delete any existing OTP for this user
    await OTP.deleteMany({ userId: user._id });

    // Save new OTP
    const newOTP = new OTP({
      userId: user._id,
      email,
      otp,
      expireAt,
    });
    await newOTP.save();

    // Send OTP via email using the email service
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error in requestOTP:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};

// Verify OTP and change password
export const verifyOTPAndChangePassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    // Validate input
    if (!userId || !otp || !newPassword) {
      return res.status(400).json({
        message: "Missing required fields",
        details: "userId, otp, and newPassword are required",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Invalid password",
        details: "Password must be at least 6 characters long",
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ userId, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if OTP is expired
    if (otpRecord.expireAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in verifyOTPAndChangePassword:", error);
    res.status(500).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};
