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
      receipt, // Single receipt during creation
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
      userId,
      name,
      email,
      studentNumber,
      level,
      department,
      gender,
      receipts: [
        {
          // Add as first receipt in array
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
      ],
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

    // Check if we're verifying a specific receipt
    if (req.body.receiptId && req.body.isVerified) {
      const receipt = order.receipts.id(req.body.receiptId);
      if (receipt) {
        receipt.isVerified = true;
        order.status = "Approved"; // Auto-approve order when receipt is verified

        try {
          // Get next available schedule
          const schedule = await getNextAvailableSchedule(new Date());
          order.measurementSchedule = schedule;

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
    }
    // Handle regular status updates
    else if (newStatus && newStatus !== previousStatus) {
      if (newStatus === "Approved") {
        try {
          // Get next available schedule
          const schedule = await getNextAvailableSchedule(new Date());
          order.measurementSchedule = schedule;

          // Verify the latest receipt
          if (order.receipts.length > 0) {
            order.receipts[order.receipts.length - 1].isVerified = true;
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
      order.status = newStatus;
    }

    // Apply any other updates from req.body
    Object.assign(order, req.body);

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Update error:", error);
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
      .select(
        "orderId name studentNumber department measurementSchedule status"
      )
      .lean();

    // Filter for approved orders with measurement schedules
    const approvedOrders = orders.filter(
      (order) => order.status === "Approved" && order.measurementSchedule
    );

    if (!approvedOrders.length) {
      return res.status(200).json([]);
    }

    // Transform the data
    const schedules = approvedOrders.map((order) => ({
      id: order._id,
      name: order.name,
      studentNumber: order.studentNumber,
      department: order.department,
      date: order.measurementSchedule.date,
      time: order.measurementSchedule.time,
      status: order.status,
      orderId: order.orderId,
    }));

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching student schedule:", error);
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
      status: "Approved",
    })
      .select(
        "orderId name studentNumber department measurementSchedule status"
      )
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(200).json([]); // Return empty array if no schedules found
    }

    // Transform the data before sending
    const schedules = orders.map((order) => ({
      id: order._id,
      name: order.name,
      studentNumber: order.studentNumber,
      department: order.department,
      date: order.measurementSchedule.date,
      time: order.measurementSchedule.time,
      status: order.status,
      orderId: order.orderId,
    }));

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching all schedules:", error);
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

    // Debug log
    console.log("Current order status:", order.status);

    // Validate order status - make case insensitive comparison
    if (order.status.toLowerCase() !== "approved") {
      return res.status(400).json({
        message: "Order must be in 'Approved' status to be measured",
        currentStatus: order.status,
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

// @desc    Verify receipt
// @route   PUT /api/student-orders/:id/verify-receipt
// @access  Private
export const verifyReceipt = async (req, res) => {
  try {
    const { receiptId } = req.body;

    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the receipt in the array
    const receipt = order.receipts.id(receiptId);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    // Verify the receipt
    receipt.isVerified = true;

    // Handle different status transitions based on current status
    if (order.status === "Pending") {
      order.status = "Approved";

      try {
        // Only get schedule for new orders (Pending status)
        if (order.status === "Pending") {
          const schedule = await getNextAvailableSchedule(new Date());
          order.measurementSchedule = schedule;
        }

        // Create notification for the student
        const student = await User.findById(order.userId);
        if (student) {
          let notification;

          if (order.status === "Pending") {
            const scheduleDateStr = schedule.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            notification = {
              title: "Order Approved and Scheduled",
              message: `Your order ${order.orderId} has been approved. Your measurement is scheduled for ${scheduleDateStr} at ${schedule.time}.`,
              read: false,
            };
          } else {
            notification = {
              title: "Payment Verified",
              message: `Your payment for order ${order.orderId} has been verified.`,
              read: false,
            };
          }

          student.notifications.push(notification);
          await student.save();
        }
      } catch (error) {
        return res.status(400).json({
          message: "Could not schedule measurement",
          error: error.message,
        });
      }
    } else if (order.status === "For Pickup") {
      // Notify the student about verified payment
      const student = await User.findById(order.userId);
      if (student) {
        const notification = {
          title: "Payment Verified",
          message: `Your payment for order ${order.orderId} has been verified.`,
          read: false,
        };

        student.notifications.push(notification);
        await student.save();
      }
    } else if (order.status === "For Verification") {
      order.status = "Payment Verified";

      const student = await User.findById(order.userId);
      if (student) {
        const notification = {
          title: "Payment Verified",
          message: `Your payment for order ${order.orderId} has been verified. Your order is now ready for pickup.`,
          read: false,
        };

        student.notifications.push(notification);
        await student.save();
      }
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Receipt verification error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add new receipt to order
// @route   PUT /api/student-orders/:id/add-receipt
// @access  Private/Student
export const addReceipt = async (req, res) => {
  try {
    const { receipt } = req.body;

    // Validate receipt data
    if (!receipt || !receipt.orNumber || !receipt.image) {
      return res.status(400).json({
        message: "Receipt OR number and image are required",
      });
    }

    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Add new receipt to the receipts array
    order.receipts.push({
      type: receipt.type,
      orNumber: receipt.orNumber.trim(),
      datePaid: receipt.datePaid,
      image: {
        filename: receipt.image.filename,
        contentType: receipt.image.contentType,
        data: receipt.image.data,
      },
      amount: receipt.amount,
      isVerified: false,
    });

    // Change status to "For Verification" when new receipt is added
    if (order.status === "Rejected" || order.status === "For Pickup") {
      order.status = "For Verification";
      order.rejectionReason = null; // Clear rejection reason if it exists
    }

    const updatedOrder = await order.save();

    // Notify job order users about new receipt
    const jobOrderUsers = await User.find({
      role: "JobOrder",
      isActive: true,
    });

    const notification = {
      title: "Receipt Needs Verification",
      message: `${order.name} (${order.studentNumber}) added a new payment of ₱${receipt.amount} that needs verification`,
      read: false,
    };

    const notificationPromises = jobOrderUsers.map(async (user) => {
      user.notifications.push(notification);
      return user.save();
    });

    await Promise.all(notificationPromises);

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error adding receipt:", error);
    res.status(400).json({ message: error.message });
  }
};
