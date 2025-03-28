import bcrypt from "bcryptjs";
import User, {
  Student,
  CommercialJob,
  Coordinator,
} from "../models/user.model.js";
import UserVerification from "../models/user.verification.js";
import {
  sendPasswordChangeEmail,
  sendVerificationEmail,
} from "../utils/emailService.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

// Rate limiting helper
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

const isAccountLocked = (email) => {
  const attempts = loginAttempts.get(email);
  if (!attempts) return false;

  if (
    attempts.count >= MAX_LOGIN_ATTEMPTS &&
    Date.now() - attempts.firstAttempt < LOCKOUT_TIME
  ) {
    return true;
  }

  if (Date.now() - attempts.firstAttempt >= LOCKOUT_TIME) {
    loginAttempts.delete(email);
    return false;
  }

  return false;
};

const recordLoginAttempt = (email) => {
  const attempts = loginAttempts.get(email);
  if (!attempts) {
    loginAttempts.set(email, { count: 1, firstAttempt: Date.now() });
  } else {
    attempts.count += 1;
  }
};

export const signup = async (req, res) => {
  try {
    const { email, password, role, ...otherDetails } = req.body;

    // Validate required fields
    const requiredFields = ["email", "password", "role", "name"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please provide the following required information: ${missingFields
          .map((field) => field.charAt(0).toUpperCase() + field.slice(1))
          .join(", ")}`,
        errors: missingFields.map(
          (field) =>
            `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        ),
      });
    }

    // Validate role-specific required fields
    const roleSpecificFields = {
      student: ["studentNumber", "studentGender", "department", "level"],
      commercial: ["address", "gender"],
      coordinator: ["department", "gender", "level"],
    };

    const requiredRoleFields = roleSpecificFields[role];
    if (requiredRoleFields) {
      const missingRoleFields = requiredRoleFields.filter(
        (field) => !otherDetails[field]
      );
      if (missingRoleFields.length > 0) {
        return res.status(400).json({
          message: `Please provide the following required ${role} information: ${missingRoleFields
            .map((field) => field.charAt(0).toUpperCase() + field.slice(1))
            .join(", ")}`,
          errors: missingRoleFields.map(
            (field) =>
              `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
          ),
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message:
          "This email address is already registered. Please use a different email or try logging in.",
        errors: ["Email is already in use"],
      });
    }

    // Validate email domain for Student and Coordinator roles
    if (
      (role === "student" || role === "coordinator") &&
      !email.endsWith("@marsu.edu.ph")
    ) {
      return res.status(422).json({
        message:
          "Students and Coordinators must use their official @marsu.edu.ph email address",
        errors: ["Invalid email domain"],
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long for security purposes",
        errors: ["Password is too short"],
      });
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

    try {
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
          return res.status(400).json({
            message:
              "Invalid role specified. Must be one of: student, commercial, coordinator",
          });
      }
    } catch (modelError) {
      return res.status(400).json({
        message: "Invalid data format",
        errors: Object.values(modelError.errors).map((err) => err.message),
      });
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

    try {
      // Send verification email
      await sendVerificationEmail(savedUser, uniqueString);

      res.status(201).json({
        message:
          "Account created successfully. Please check your email to verify your account.",
        userId: savedUser._id,
      });
    } catch (emailError) {
      // If email fails, delete the user and verification record
      await UserVerification.deleteOne({ userId: savedUser._id });
      await User.deleteOne({ _id: savedUser._id });

      return res.status(500).json({
        message:
          "Failed to send verification email. Please try signing up again.",
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message:
        "We encountered an issue while creating your account. Please try again later.",
      errors: [error.message],
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, uniqueString } = req.params;
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // Find the verification record
    const verificationRecord = await UserVerification.findOne({ userId });

    if (!verificationRecord) {
      return res.redirect(`${frontendUrl}/verification-error?type=not_found`);
    }

    // Check if verification record has expired
    if (verificationRecord.expireAt < Date.now()) {
      // Remove the expired verification record and unverified user
      await UserVerification.deleteOne({ userId });
      await User.deleteOne({ _id: userId });

      return res.redirect(`${frontendUrl}/verification-error?type=expired`);
    }

    // Compare the unique string
    const isValid = await bcrypt.compare(
      uniqueString,
      verificationRecord.uniqueString
    );

    if (!isValid) {
      return res.redirect(`${frontendUrl}/verification-error?type=invalid`);
    }

    // Update user verification status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.redirect(`${frontendUrl}/verification-error?type=not_found`);
    }

    // Delete verification record after successful verification
    await UserVerification.deleteOne({ userId });

    // Redirect to success page
    return res.redirect(`${frontendUrl}/verification-success`);
  } catch (error) {
    console.error("Verification error:", error);
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/verification-error?type=invalid`);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for account lockout
    if (isAccountLocked(email)) {
      return res.status(429).json({
        message: "Account temporarily locked. Please try again later.",
        lockoutRemaining: Math.ceil(
          (LOCKOUT_TIME -
            (Date.now() - loginAttempts.get(email).firstAttempt)) /
            1000 /
            60
        ),
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.verified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    // Check if JobOrder account is active
    if (user.role === "JobOrder" && !user.isActive) {
      return res.status(401).json({
        message:
          "Your account is currently deactivated. Please contact the administrator for assistance.",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      recordLoginAttempt(email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Reset login attempts on successful login
    loginAttempts.delete(email);

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie options based on environment
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: '/',
      maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
    };

    // Set access token in cookie
    res.cookie("access_token", accessToken, cookieOptions);

    // Send user data (excluding sensitive information)
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "An error occurred during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear access token with same settings as when setting it
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: '/'
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
};

export const getMe = async (req, res) => {
  try {
    // User is already verified by authenticateUser middleware
    const user = await User.findById(req.user.id).select(
      "-password -tokenVersion"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "Error fetching user data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Changed from _id to id to match the JWT payload

    // Get user from database
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await sendPasswordChangeEmail(user.email, user.name);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to change password",
    });
  }
};
