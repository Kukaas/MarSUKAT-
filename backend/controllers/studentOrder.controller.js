import StudentOrder from "../models/studentOrder.model.js";
import User from "../models/user.model.js";
import Announcement from "../models/announcement.model.js";
import mongoose from "mongoose";
import { getNextAvailableSchedule } from "../utils/scheduleUtils.js";

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

    const previousStatus = order.status;
    const newStatus = req.body.status;
    const isVerifyingReceipt = req.body["receipt.isVerified"] === true;

    // If approving receipt or status
    if (
      (isVerifyingReceipt && !order.receipt.isVerified) ||
      (newStatus === "Approved" && previousStatus !== "Approved")
    ) {
      try {
        // Get next available schedule
        const schedule = await getNextAvailableSchedule(new Date());

        // Update order with schedule and sync approval
        req.body.measurementSchedule = schedule;

        // Synchronize both receipt verification and order status
        if (isVerifyingReceipt) {
          req.body.status = "Approved";
          order.receipt.isVerified = true;
        } else if (newStatus === "Approved") {
          order.receipt.isVerified = true;
          req.body["receipt.isVerified"] = true;
        }

        // Create notification for the student
        const student = await User.findById(order.userId);
        if (student) {
          const scheduleDateStr = schedule.date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const notification = {
            title: "Order Approved and Scheduled",
            message: `Your order ${order.orderId} has been approved. Your measurement is scheduled for ${scheduleDateStr} at ${schedule.time}.`,
            read: false,
          };

          student.notifications.push(notification);
          await student.save();
        }
      } catch (error) {
        return res.status(400).json({
          message: "Could not schedule measurement",
          error: error.message,
        });
      }
    }

    // Update the order
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

// @desc    Reject order
// @route   PUT /api/student-orders/:id/reject
// @access  Private
export const rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status and add rejection reason
    order.status = "Rejected";
    order.rejectionReason = reason;

    // If order was previously approved, clear the measurement schedule
    if (order.measurementSchedule) {
      order.measurementSchedule = null;
    }

    const updatedOrder = await order.save();

    // Find the student and send notification
    const student = await User.findById(order.userId);
    if (student) {
      const notification = {
        title: "Order Rejected",
        message: `Your order ${order.orderId} has been rejected. Reason: ${reason}`,
        read: false,
      };

      student.notifications.push(notification);
      await student.save();
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's schedule
// @route   GET /api/student-orders/schedules/user/:userId
// @access  Private/Student
export const getMySchedule = async (req, res) => {
  try {
    const { userId } = req.params;

    // First get all orders for the user
    const orders = await StudentOrder.find({ userId })
      .select('orderId name studentNumber department measurementSchedule status')
      .lean();

    // Filter for approved orders with measurement schedules
    const approvedOrders = orders.filter(
      order => order.status === 'Approved' && order.measurementSchedule
    );

    if (!approvedOrders.length) {
      return res.status(200).json([]);
    }

    // Transform the data
    const schedules = approvedOrders.map(order => ({
      id: order._id,
      name: order.name,
      studentNumber: order.studentNumber,
      department: order.department,
      date: order.measurementSchedule.date,
      time: order.measurementSchedule.time,
      status: order.status,
      orderId: order.orderId
    }));

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all schedules
// @route   GET /api/student-orders/schedules/all
// @access  Private/JobOrder
export const getAllSchedules = async (req, res) => {
  try {
    const orders = await StudentOrder.find({
      measurementSchedule: { $exists: true, $ne: null },
      status: 'Approved'
    })
    .select('orderId name studentNumber department measurementSchedule status')
    .lean();

    if (!orders || orders.length === 0) {
      return res.status(200).json([]); // Return empty array if no schedules found
    }

    // Transform the data before sending
    const schedules = orders.map(order => ({
      id: order._id,
      name: order.name,
      studentNumber: order.studentNumber,
      department: order.department,
      date: order.measurementSchedule.date,
      time: order.measurementSchedule.time,
      status: order.status,
      orderId: order.orderId
    }));

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching all schedules:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add order items and mark as measured
// @route   PUT /api/student-orders/:id/measure
// @access  Private/JobOrder
export const addOrderItemsAndMeasure = async (req, res) => {
  try {
    const { orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate order status
    if (order.status !== "Approved") {
      return res.status(400).json({ 
        message: "Order must be in 'Approved' status to be measured" 
      });
    }

    // Update order items and calculate total price
    order.orderItems = orderItems;
    order.calculateTotalPrice();
    order.status = "Measured";

    const updatedOrder = await order.save();

    // Notify the student
    const student = await User.findById(order.userId);
    if (student) {
      const notification = {
        title: "Measurement Complete",
        message: `Your measurements have been recorded for order ${order.orderId}. Total amount: ₱${order.totalPrice}`,
        read: false,
      };

      student.notifications.push(notification);
      await student.save();
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order items:", error);
    res.status(400).json({ message: error.message });
  }
};
