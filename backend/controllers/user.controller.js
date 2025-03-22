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

// Create Staff User (JobOrder or BAO) (SuperAdmin only)
export const createStaffUser = async (req, res) => {
  try {
    const { name, email, position, role } = req.body;

    // Validate role
    if (!['JobOrder', 'BAO'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be either JobOrder or BAO" });
    }

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

    // Create staff user
    const staffUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      position,
      isActive: true,
      verified: false,
    });

    if (staffUser) {
      // Update and save verification record with user ID
      verificationRecord.userId = staffUser._id;
      await verificationRecord.save();

      // Send verification email with account details
      try {
        await sendVerificationEmail(
          {
            _id: staffUser._id,
            email,
            name,
            role,
            password,
          },
          uniqueString
        );
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Delete the created user and verification record if email fails
        await UserVerification.deleteOne({ userId: staffUser._id });
        await User.findByIdAndDelete(staffUser._id);
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      res.status(201).json({
        _id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        position: staffUser.position,
        isActive: staffUser.isActive,
        verified: staffUser.verified,
        message:
          `${role} account created. Please verify your email to activate the account.`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all staff users (JobOrder and BAO)
export const getAllStaffUsers = async (req, res) => {
  try {
    const staffUsers = await User.find({ role: { $in: ['JobOrder', 'BAO'] } }).select("-password");
    res.status(200).json(staffUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get staff user by ID
export const getStaffUserById = async (req, res) => {
  try {
    const staffUser = await User.findOne({
      _id: req.params.id,
      role: { $in: ['JobOrder', 'BAO'] }
    }).select("-password");

    if (!staffUser) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    res.status(200).json(staffUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update staff user
export const updateStaffUser = async (req, res) => {
  try {
    const staffUser = await User.findOne({
      _id: req.params.id,
      role: { $in: ['JobOrder', 'BAO'] }
    });

    if (!staffUser) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    const { name, email, password, position } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== staffUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    staffUser.name = name || staffUser.name;
    staffUser.email = email || staffUser.email;
    staffUser.position = position || staffUser.position;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      staffUser.password = await bcrypt.hash(password, salt);
    }

    const updatedStaffUser = await staffUser.save();

    res.status(200).json({
      _id: updatedStaffUser._id,
      name: updatedStaffUser.name,
      email: updatedStaffUser.email,
      role: updatedStaffUser.role,
      position: updatedStaffUser.position,
      isActive: updatedStaffUser.isActive,
      message: "Staff user updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete staff user
export const deleteStaffUser = async (req, res) => {
  try {
    const staffUser = await User.findOne({
      _id: req.params.id,
      role: { $in: ['JobOrder', 'BAO'] }
    });

    if (!staffUser) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    await staffUser.deleteOne();
    res.status(200).json({ message: "Staff user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Activate staff user
export const activateStaffUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ['JobOrder', 'BAO'] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      message: `${user.role} account activated successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deactivate staff user
export const deactivateStaffUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ['JobOrder', 'BAO'] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      message: `${user.role} account deactivated successfully`,
    });
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
      if (req.body.position) user.position = req.body.position;
    } else if (user.role === "BAO") {
      // BAO specific updates
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

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.notifications || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = user.notifications.id(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await user.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.notifications && user.notifications.length > 0) {
      user.notifications.forEach(notification => {
        notification.read = true;
      });
      await user.save();
    }

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create a notification
export const createNotification = async (userId, title, message) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.notifications.push({
      title,
      message,
      read: false,
      createdAt: new Date()
    });

    await user.save();
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};
