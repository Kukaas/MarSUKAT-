import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import StudentOrder from "../models/studentOrder.model.js";
import { getNextAvailableSchedule } from "../utils/scheduleUtils.js";

/**
 * Developer-only endpoint to switch between user accounts
 * This should ONLY be enabled in development environments
 */
export const switchUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Create access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to false in development
      sameSite: "strict",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    };

    // Set refresh token cookie
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Set access token cookie
    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    res.status(200).json({
      message: `Successfully switched to user: ${user.name} (${user.role})`,
      user,
    });
  } catch (error) {
    console.error("Dev switch user error:", error);
    res.status(500).json({
      message: "An error occurred while switching users",
      error: error.message,
    });
  }
};

/**
 * Get a list of available users for switching
 * This should ONLY be enabled in development environments
 */
export const getAvailableUsers = async (req, res) => {
  try {
    // Get a list of users with minimal information
    const users = await User.find()
      .select("email name role")
      .sort({ role: 1, name: 1 })
      .limit(20);

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Dev get users error:", error);
    res.status(500).json({
      message: "An error occurred while fetching available users",
      error: error.message,
    });
  }
};

/**
 * Create test order
 * This should ONLY be enabled in development environments
 */
export const createTestOrder = async (req, res) => {
  try {
    const { studentEmail } = req.body;

    if (!studentEmail) {
      return res.status(400).json({
        message: "Student email is required",
      });
    }

    // Find the student user by email
    const student = await User.findOne({ 
      email: studentEmail,
      role: "Student" 
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Create a test receipt
    const testReceipt = {
      type: "Down Payment",
      orNumber: `TEST-${Date.now()}`,
      datePaid: new Date(),
      image: {
        filename: "test-receipt.jpg",
        contentType: "image/jpeg",
        data: "data:image/jpeg;base64,/9j/4AAQSkZJRg==" // Minimal base64 image data
      },
      amount: 500
    };

    // Create the order
    const newOrder = new StudentOrder({
      userId: student._id,
      name: student.name,
      email: student.email,
      studentNumber: student.studentNumber,
      level: student.level,
      department: student.department,
      gender: student.studentGender,
      receipts: [testReceipt]
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Test order created successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Test order creation error:", error);
    res.status(400).json({ 
      message: "Error creating test order",
      error: error.message 
    });
  }
};

/**
 * Delete all student orders
 * This should ONLY be enabled in development environments
 */
export const deleteAllOrders = async (req, res) => {
  try {
    await StudentOrder.deleteMany({});
    
    res.status(200).json({
      message: "All orders deleted successfully"
    });
  } catch (error) {
    console.error("Delete all orders error:", error);
    res.status(500).json({
      message: "An error occurred while deleting orders",
      error: error.message
    });
  }
};

/**
 * Create multiple test orders
 * This should ONLY be enabled in development environments
 */
export const createMassOrders = async (req, res) => {
  try {
    const { count = 1, studentEmail } = req.body;

    if (!studentEmail) {
      return res.status(400).json({
        message: "Student email is required"
      });
    }

    // Find the student user by email
    const student = await User.findOne({ 
      email: studentEmail,
      role: "Student" 
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const savedOrders = [];

    // Create and save orders one by one to ensure unique orderIds
    for (let i = 0; i < count; i++) {
      const testReceipt = {
        type: "Down Payment",
        orNumber: `TEST-${Date.now()}-${i}`,
        datePaid: new Date(),
        image: {
          filename: "test-receipt.jpg",
          contentType: "image/jpeg",
          data: "data:image/jpeg;base64,/9j/4AAQSkZJRg==" // Minimal base64 image data
        },
        amount: 500
      };

      const newOrder = new StudentOrder({
        userId: student._id,
        name: student.name,
        email: student.email,
        studentNumber: student.studentNumber,
        level: student.level,
        department: student.department,
        gender: student.studentGender,
        receipts: [testReceipt]
      });

      // Save each order individually to ensure unique orderId generation
      const savedOrder = await newOrder.save();
      savedOrders.push(savedOrder);
    }

    res.status(201).json({
      message: `${savedOrders.length} test orders created successfully`,
      orders: savedOrders
    });
  } catch (error) {
    console.error("Mass order creation error:", error);
    res.status(400).json({ 
      message: "Error creating mass orders",
      error: error.message 
    });
  }
};

/**
 * Approve all pending orders and schedule them
 * This should ONLY be enabled in development environments
 */
export const approveAllOrders = async (req, res) => {
  try {
    // Find all pending orders
    const pendingOrders = await StudentOrder.find({ 
      status: "Pending",
      isArchived: false
    });

    if (pendingOrders.length === 0) {
      return res.status(200).json({
        message: "No pending orders found to approve"
      });
    }

    const approvedOrders = [];
    const errors = [];

    // Process each order
    for (const order of pendingOrders) {
      try {
        // Get next available schedule for this order
        const schedule = await getNextAvailableSchedule(new Date());
        
        // Update order
        order.measurementSchedule = schedule;
        order.status = "Approved";

        // Verify the latest receipt
        if (order.receipts.length > 0) {
          order.receipts[order.receipts.length - 1].isVerified = true;
        }

        // Save the order
        const savedOrder = await order.save();
        approvedOrders.push(savedOrder);

      } catch (error) {
        errors.push({
          orderId: order.orderId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: `${approvedOrders.length} orders approved successfully`,
      approvedCount: approvedOrders.length,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Mass order approval error:", error);
    res.status(500).json({
      message: "An error occurred while approving orders",
      error: error.message
    });
  }
};

/**
 * Delete a user by email
 * This should ONLY be enabled in development environments
 */
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Find and delete the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: `Successfully deleted user: ${user.name} (${user.role})`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Dev delete user error:", error);
    res.status(500).json({
      message: "An error occurred while deleting user",
      error: error.message
    });
  }
};
