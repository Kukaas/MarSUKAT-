import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../utils/emailService.js";
import UserVerification from "../models/user.verification.js";
import { generateSecurePassword } from "../utils/passwordGenerator.js";

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent JobOrder creation through regular registration
    if (role === "JobOrder") {
      return res.status(403).json({
        message: "JobOrder accounts can only be created by SuperAdmin",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification string
    const uniqueString = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedUniqueString = await bcrypt.hash(uniqueString, salt);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verified: false,
      ...req.body,
    });

    if (user) {
      // Create verification record
      const verificationRecord = new UserVerification({
        userId: user._id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expireAt: Date.now() + 21600000, // 6 hours
      });
      await verificationRecord.save();

      // Send verification email
      try {
        await sendVerificationEmail(
          {
            _id: user._id,
            email,
            name,
            role,
          },
          uniqueString
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Delete the created user and verification record if email fails
        await UserVerification.deleteOne({ userId: user._id });
        await User.findByIdAndDelete(user._id);
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        message:
          "Account created successfully. Please check your email for verification.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create JobOrder (SuperAdmin only)
export const createJobOrder = async (req, res) => {
  try {
    const { name, email, gender, jobType, jobDescription } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate random password
    const password = generateSecurePassword();

    // Generate verification string
    const uniqueString = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedUniqueString = await bcrypt.hash(uniqueString, salt);

    // Create verification record
    const verificationRecord = new UserVerification({
      userId: null, // Will be updated after user creation
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 21600000, // 6 hours
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create JobOrder user
    const jobOrder = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "JobOrder",
      gender,
      jobType,
      jobDescription,
      isActive: true,
      verified: false,
    });

    if (jobOrder) {
      // Update and save verification record with user ID
      verificationRecord.userId = jobOrder._id;
      await verificationRecord.save();

      // Send verification email with account details
      try {
        await sendVerificationEmail(
          {
            _id: jobOrder._id,
            email,
            name,
            role: "JobOrder",
            password,
          },
          uniqueString
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Delete the created user and verification record if email fails
        await UserVerification.deleteOne({ userId: jobOrder._id });
        await User.findByIdAndDelete(jobOrder._id);
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      res.status(201).json({
        _id: jobOrder._id,
        name: jobOrder.name,
        email: jobOrder.email,
        role: jobOrder.role,
        gender: jobOrder.gender,
        jobType: jobOrder.jobType,
        jobDescription: jobOrder.jobDescription,
        isActive: jobOrder.isActive,
        verified: jobOrder.verified,
        message:
          "Job order account created. Please verify your email to activate the account.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    // Convert both IDs to strings for comparison
    if (req.params.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this profile" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    // Convert both IDs to strings for comparison
    if (req.params.userId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Handle photo update with base64 data
    if (req.body.photo === null) {
      // If photo is explicitly set to null, remove the photo
      user.photo = undefined;
    } else if (req.body.photo && req.body.photo.data) {
      // Check if image size exceeds 10MB (10 * 1024 * 1024 bytes)
      const base64Size = Buffer.from(req.body.photo.data, "base64").length;
      if (base64Size > 10 * 1024 * 1024) {
        return res
          .status(400)
          .json({ message: "Image size must not exceed 10MB" });
      }

      user.photo = {
        filename: req.body.photo.filename || "profile-image",
        contentType: req.body.photo.contentType || "image/jpeg",
        data: req.body.photo.data,
      };
    }

    // Handle role-specific updates
    if (user.role === "Student") {
      if (req.body.studentNumber) user.studentNumber = req.body.studentNumber;
      if (req.body.studentGender) user.studentGender = req.body.studentGender;
      if (req.body.department) user.department = req.body.department;
      if (req.body.level) user.level = req.body.level;
    } else if (user.role === "CommercialJob") {
      if (req.body.address) user.address = req.body.address;
      if (req.body.gender) user.gender = req.body.gender;
    } else if (user.role === "Coordinator") {
      if (req.body.department) user.department = req.body.department;
      if (req.body.level) user.level = req.body.level;
      if (req.body.gender) user.gender = req.body.gender;
    } else if (user.role === "JobOrder") {
      if (req.body.gender) user.gender = req.body.gender;
      if (req.body.jobType) user.jobType = req.body.jobType;
      if (req.body.jobDescription)
        user.jobDescription = req.body.jobDescription;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      role: updatedUser.role,
      ...updatedUser._doc,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all JobOrders
export const getAllJobOrders = async (req, res) => {
  try {
    const jobOrders = await User.find({ role: "JobOrder" }).select("-password");
    res.status(200).json(jobOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get JobOrder by ID
export const getJobOrderById = async (req, res) => {
  try {
    const jobOrder = await User.findOne({
      _id: req.params.id,
      role: "JobOrder",
    }).select("-password");

    if (!jobOrder) {
      return res.status(404).json({ message: "Job order not found" });
    }

    res.status(200).json(jobOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update JobOrder
export const updateJobOrder = async (req, res) => {
  try {
    const jobOrder = await User.findOne({
      _id: req.params.id,
      role: "JobOrder",
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job order not found" });
    }

    const { name, email, password, gender, jobType, jobDescription } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== jobOrder.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    jobOrder.name = name || jobOrder.name;
    jobOrder.email = email || jobOrder.email;
    jobOrder.gender = gender || jobOrder.gender;
    jobOrder.jobType = jobType || jobOrder.jobType;
    jobOrder.jobDescription = jobDescription || jobOrder.jobDescription;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      jobOrder.password = await bcrypt.hash(password, salt);
    }

    const updatedJobOrder = await jobOrder.save();

    res.status(200).json({
      _id: updatedJobOrder._id,
      name: updatedJobOrder.name,
      email: updatedJobOrder.email,
      role: updatedJobOrder.role,
      gender: updatedJobOrder.gender,
      jobType: updatedJobOrder.jobType,
      jobDescription: updatedJobOrder.jobDescription,
      isActive: updatedJobOrder.isActive,
      message: "Job order updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete JobOrder
export const deleteJobOrder = async (req, res) => {
  try {
    const jobOrder = await User.findOne({
      _id: req.params.id,
      role: "JobOrder",
    });

    if (!jobOrder) {
      return res.status(404).json({ message: "Job order not found" });
    }

    await jobOrder.deleteOne();
    res.status(200).json({ message: "Job order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Activate JobOrder
export const activateJobOrder = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "JobOrder") {
      return res
        .status(400)
        .json({ message: "User is not a JobOrder account" });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(400).json({
        message: "Email must be verified before activating the account",
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      verified: user.verified,
      message: "JobOrder account activated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deactivate JobOrder
export const deactivateJobOrder = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "JobOrder") {
      return res
        .status(400)
        .json({ message: "User is not a JobOrder account" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      message: "JobOrder account deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
