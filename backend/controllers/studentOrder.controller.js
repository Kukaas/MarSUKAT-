import StudentOrder from "../models/studentOrder.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { getNextAvailableSchedule } from "../utils/scheduleUtils.js";
import SalesReport from "../models/salesReport.model.js";
import UniformInventory from "../models/uniformInventory.model.js";
import { sendMeasurementDetailsEmail, sendPaymentReminderEmail, sendPickupEmail, sendScheduleEmail } from "../utils/emailService.js";

// @desc    Get all orders
// @route   GET /api/student-orders
// @access  Private
export const getAllStudentOrders = async (req, res) => {
  try {
    const orders = await StudentOrder.find({ isArchived: false });
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

    const existingOrNumber = await StudentOrder.findOne({
      "receipts.orNumber": receipt.orNumber.trim(),
    });

    if (existingOrNumber) {
      return res.status(400).json({ message: "OR Number already exists" });
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

            // Send schedule email
            await sendScheduleEmail(student.email, student.name, order.orderId, schedule);
          }
        } catch (error) {
          return res.status(400).json({
            message: "Could not schedule measurement",
            error: error.message,
          });
        }
      }

      if (newStatus === "For Pickup") {
        // Notify the student about the pickup
        const student = await User.findById(order.userId);
        if (student) {
          const notification = {
            title: "Order Ready for Pickup",
            message: `Your order ${order.orderId} is ready for pickup. Please check your email for details.`,
            read: false,
          };

          student.notifications.push(notification);
          await student.save();
        }

        await sendPaymentReminderEmail(
          student.email,
          student.name,
          order.orderId,
          order.totalPrice 
        );
      }

      if (newStatus === "Claimed") {
        try {
          // Validate order items exist
          if (!order.orderItems || order.orderItems.length === 0) {
            return res.status(400).json({ 
              message: "Cannot claim order without order items" 
            });
          }

          order.isArchived = true;
          
          // Process all inventory updates in a transaction
          const session = await mongoose.startSession();
          await session.withTransaction(async () => {
            // Update inventory for each order item
            for (const item of order.orderItems) {
              const inventory = await UniformInventory.findOne({
                level: item.level,
                productType: item.productType,
                size: item.size
              }).session(session);

              if (!inventory) {
                throw new Error(`Inventory not found for ${item.productType} - ${item.size}`);
              }

              if (inventory.quantity < item.quantity) {
                throw new Error(`Insufficient inventory for ${item.productType} - ${item.size}. Required: ${item.quantity}, Available: ${inventory.quantity}`);
              }

              // Decrease quantity
              inventory.quantity -= item.quantity;

              // Update status based on new quantity
              if (inventory.quantity === 0) {
                inventory.status = "Out of Stock";
              } else if (inventory.quantity <= 50) {
                inventory.status = "Low Stock";
              } else {
                inventory.status = "Available";
              }

              await inventory.save({ session });
            }

            // Calculate subtotals and total amount
            const orderItems = order.orderItems.map(item => ({
              level: item.level,
              productType: item.productType,
              size: item.size,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: Number((item.unitPrice * item.quantity).toFixed(2))
            }));

            const totalAmount = Number(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

            // Create sales report
            const salesReport = new SalesReport({
              orderId: order.orderId,
              studentName: order.name,
              studentNumber: order.studentNumber,
              department: order.department,
              orderItems: orderItems,
              totalAmount: totalAmount,
              dateClaimed: new Date(),
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear()
            });

            await salesReport.save({ session });
            order.status = newStatus;
            await order.save({ session });
          });

          await session.endSession();

          // Create notification for the student
          const student = await User.findById(order.userId);
          if (student) {
            const notification = {
              title: "Order Claimed",
              message: `Your order ${order.orderId} has been claimed. Thank you for your business!`,
              read: false,
            };

            student.notifications.push(notification);
            await student.save();
          }
        } catch (error) {
          console.error("Error processing claimed order:", error);
          return res.status(400).json({
            message: "Error processing claimed order",
            error: error.message
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

    await sendMeasurementDetailsEmail(
      student.email,
      student.name,
      order.orderId,
      order.orderItems,
      order.totalPrice
    );

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
      try {
        // Get schedule for new orders (Pending status)
        const schedule = await getNextAvailableSchedule(new Date());
        order.measurementSchedule = schedule;
        order.status = "Approved";

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

          await sendScheduleEmail(student.email, student.name, order.orderId, schedule);
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
        await sendPickupEmail(
          student.email,
          student.name,
          order.orderId,
        )
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

// @desc    Archive student order
// @route   PUT /api/student-orders/:id/archive
// @access  Private/JobOrder
export const archiveStudentOrder = async (req, res) => {
  try {
    const order = await StudentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isArchived = !order.isArchived; // Toggle archive status
    
    const updatedOrder = await order.save();
    
    const archiveAction = order.isArchived ? "archived" : "unarchived";
    res.status(200).json({ 
      message: `Order ${updatedOrder.orderId} ${archiveAction} successfully`,
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Error archiving order:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all archived student orders
// @route   GET /api/student-orders/archived
// @access  Private/JobOrder
export const getArchivedStudentOrders = async (req, res) => {
  try {
    const archivedOrders = await StudentOrder.find({ isArchived: true });
    res.status(200).json(archivedOrders);
  } catch (error) {
    console.error("Error fetching archived orders:", error);
    res.status(500).json({ message: error.message });
  }
};
