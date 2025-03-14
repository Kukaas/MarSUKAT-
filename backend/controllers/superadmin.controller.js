import bcrypt from "bcryptjs";
import User, { SuperAdmin } from "../models/user.model.js";
import { generateSecurePassword } from "../utils/passwordGenerator.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { v4 as uuidv4 } from "uuid";
import UserVerification from "../models/user.verification.js";

export const createSuperAdmin = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        message: "Name and email are required",
        error: "MISSING_FIELDS",
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
        error: "EMAIL_EXISTS",
      });
    }

    // Check if super admin already exists (more specific check)
    const existingSuperAdmin = await User.findOne({
      role: "SuperAdmin",
      verified: true,
    });

    if (existingSuperAdmin) {
      return res.status(400).json({
        message: "A verified Super Admin already exists",
        error: "SUPERADMIN_EXISTS",
      });
    }

    // Generate random password
    const password = generateSecurePassword();

    // Generate verification string
    const uniqueString = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedUniqueString = await bcrypt.hash(uniqueString, salt);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin
    const superAdmin = new SuperAdmin({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
      verified: false,
      role: "SuperAdmin",
    });

    const savedSuperAdmin = await superAdmin.save();

    // Create verification record
    const verificationRecord = new UserVerification({
      userId: savedSuperAdmin._id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 21600000, // 6 hours
    });
    await verificationRecord.save();

    // Send verification email with account details
    try {
      await sendVerificationEmail(
        {
          _id: savedSuperAdmin._id,
          email,
          name,
          role: "SuperAdmin",
          password,
        },
        uniqueString
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Delete the created user and verification record if email fails
      await UserVerification.deleteOne({ userId: savedSuperAdmin._id });
      await User.findByIdAndDelete(savedSuperAdmin._id);
      return res.status(500).json({
        message: "Failed to send verification email",
        error: "EMAIL_SEND_FAILED",
      });
    }

    res.status(201).json({
      message:
        "Super Admin created successfully. Please check your email for verification.",
      userId: savedSuperAdmin._id,
    });
  } catch (error) {
    console.error("Super Admin creation error:", error);
    res.status(500).json({
      message: "Error creating Super Admin",
      error: error.message || "UNKNOWN_ERROR",
    });
  }
};
