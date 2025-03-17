import StudentOrder from "../models/studentOrder.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// @desc    Get all orders
// @route   GET /api/student-orders
// @access  Private
export const getAllStudentOrders = async (req, res) => {
  try {
    const orders = await StudentOrder.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/student-orders/:id
// @access  Private
export const getStudentOrderById = async (req, res) => {
  try {
    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/student-orders
// @access  Private
export const createStudentOrder = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      studentNumber,
      level,
      department,
      gender,
      receipt,
    } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate OR number is provided
    if (!receipt.orNumber) {
      return res.status(400).json({ message: "OR Number is required" });
    }

    // Validate image is provided
    if (!receipt.image) {
      return res.status(400).json({ message: "Receipt image is required" });
    }

    const newOrder = new StudentOrder({
      userId, // Use userId from request body
      name,
      email,
      studentNumber,
      level,
      department,
      gender,
      receipt: {
        type: receipt.type,
        orNumber: receipt.orNumber.trim(),
        datePaid: receipt.datePaid,
        image: {
          filename: receipt.image.filename,
          contentType: receipt.image.contentType,
          data: receipt.image.data,
        },
        amount: receipt.amount,
      },
    });

    console.log("Creating order with data:", {
      userId: newOrder.userId,
      name: newOrder.name,
      // ... other fields for debugging
    });

    const savedOrder = await newOrder.save();

    // Find all active JobOrder users
    const jobOrderUsers = await User.find({
      role: "JobOrder",
      isActive: true,
    });

    // Create simple notification
    const notification = {
      title: "New Order Received",
      message: `${name} (${studentNumber}) from ${department} submitted a payment of ₱${receipt.amount}`,
      read: false,
    };

    // Add notification to each JobOrder user
    const notificationPromises = jobOrderUsers.map(async (user) => {
      user.notifications.push(notification);
      return user.save();
    });

    await Promise.all(notificationPromises);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order
// @route   PUT /api/student-orders/:id
// @access  Private
export const updateStudentOrder = async (req, res) => {
  try {
    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    Object.assign(order, req.body);
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/student-orders/:id
// @access  Private
export const deleteStudentOrder = async (req, res) => {
  try {
    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders by user ID
// @route   GET /api/student-orders/user/:userId
// @access  Private
export const getOrdersByUserId = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const orders = await StudentOrder.find({ userId: req.params.userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      message: "Error retrieving orders",
      error: error.message,
    });
  }
};
