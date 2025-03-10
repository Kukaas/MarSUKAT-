import bcrypt from "bcryptjs";
import User, {
  Student,
  CommercialJob,
  Coordinator,
} from "../models/user.model.js";
import UserVerification from "../models/user.verification.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { email, password, role, ...otherDetails } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user based on role
    let newUser;
    const baseUserData = {
      ...otherDetails,
      email,
      password: hashedPassword,
      verified: false,
    };

    switch (role) {
      case "student":
        newUser = new Student(baseUserData);
        break;
      case "commercial":
        newUser = new CommercialJob(baseUserData);
        break;
      case "coordinator":
        newUser = new Coordinator(baseUserData);
        break;
      default:
        return res.status(400).json({ message: "Invalid role specified" });
    }

    // Save the user
    const savedUser = await newUser.save();

    // Handle email verification
    const uniqueString = uuidv4();
    const hashedUniqueString = await bcrypt.hash(uniqueString, salt);

    // Create verification record
    const newVerification = new UserVerification({
      userId: savedUser._id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 21600000, // Expires in 6 hours
    });

    await newVerification.save();

    // Send verification email
    await sendVerificationEmail(savedUser, uniqueString);

    res.status(201).json({
      message:
        "User created successfully. Please check your email to verify your account.",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, uniqueString } = req.params;
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // Find the verification record
    const verificationRecord = await UserVerification.findOne({ userId });

    if (!verificationRecord) {
      return res.status(404).json({
        message:
          "Verification record not found or has expired. Please sign up again.",
      });
    }

    // Check if verification record has expired
    if (verificationRecord.expireAt < Date.now()) {
      // Remove the expired verification record
      await UserVerification.deleteOne({ userId });
      await User.deleteOne({ _id: userId }); // Optional: delete unverified user
      return res.status(410).json({
        message: "Verification link has expired. Please sign up again.",
      });
    }

    // Compare the unique string
    const isValid = await bcrypt.compare(
      uniqueString,
      verificationRecord.uniqueString
    );

    if (!isValid) {
      return res.status(400).json({
        message:
          "Invalid verification link. Please check your link and try again.",
      });
    }

    // After successful verification
    if (isValid) {
      // Update user verification status
      await User.updateOne({ _id: userId }, { verified: true });

      // Delete verification record
      await UserVerification.deleteOne({ userId });

      // Redirect to frontend success page
      return res.redirect(`${frontendUrl}/verification-success`);
    }

    // If verification fails, redirect to error page
    return res.redirect(`${frontendUrl}/verification-error`);
  } catch (error) {
    console.error("Verification error:", error);
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/verification-error`);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is verified
    if (!user.verified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" } // Token expires in 5 hours
    );

    // Set cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
      httpOnly: true, // Cookie cannot be accessed by client-side JS
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      sameSite: "strict",
    };

    // Send token in cookie
    res.cookie("auth_token", token, cookieOptions);

    // Send user data (excluding sensitive information)
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
};
