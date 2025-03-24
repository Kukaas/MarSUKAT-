import AcademicGownInventory from "../models/academicGownInventory.model.js";
import { createNotification } from "./user.controller.js";
import User from "../models/user.model.js";

// @desc    Get all academic gown inventory items
// @route   GET /api/academic-gown-inventory
// @access  Private
export const getAllAcademicGownInventory = async (req, res) => {
  try {
    const inventory = await AcademicGownInventory.find().sort({ createdAt: -1 });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get academic gown inventory item by ID
// @route   GET /api/academic-gown-inventory/:id
// @access  Private
export const getAcademicGownInventoryById = async (req, res) => {
  try {
    const inventoryItem = await AcademicGownInventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.status(200).json(inventoryItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new academic gown inventory item
// @route   POST /api/academic-gown-inventory
// @access  Private/JobOrder
export const createAcademicGownInventory = async (req, res) => {
  try {
    const { level, productType, size, quantity, status, image } = req.body;

    // Check if inventory item already exists
    let inventoryItem = await AcademicGownInventory.findOne({
      level,
      productType,
      size,
    });

    if (inventoryItem) {
      return res.status(400).json({
        message: "Inventory item already exists. Use update endpoint to modify quantity.",
      });
    }

    // Create new inventory item
    inventoryItem = new AcademicGownInventory({
      level,
      productType,
      size,
      quantity: parseInt(quantity),
      status,
      image: image || undefined,
    });

    const savedItem = await inventoryItem.save();

    // Check if quantity is low and notify BAO users
    if (savedItem.status === "Low Stock" || savedItem.status === "Out of Stock") {
      const baoUsers = await User.find({ role: "BAO", isActive: true });
      const notificationMessage = `${savedItem.status} alert: ${savedItem.productType} (${savedItem.level} - ${savedItem.size}) inventory is ${savedItem.status.toLowerCase()}. Current quantity: ${savedItem.quantity}`;

      for (const baoUser of baoUsers) {
        await createNotification(
          baoUser._id,
          "Academic Gown Inventory Alert",
          notificationMessage
        );
      }
    }

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create inventory item",
      error: error.message,
    });
  }
};

// @desc    Update academic gown inventory item
// @route   PUT /api/academic-gown-inventory/:id
// @access  Private/JobOrder
export const updateAcademicGownInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const inventoryItem = await AcademicGownInventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Update the inventory item
    Object.assign(inventoryItem, updates);
    const updatedItem = await inventoryItem.save();

    // Check if quantity is low and notify BAO users
    if (updatedItem.status === "Low Stock" || updatedItem.status === "Out of Stock") {
      const baoUsers = await User.find({ role: "BAO", isActive: true });
      const notificationMessage = `${updatedItem.status} alert: ${updatedItem.productType} (${updatedItem.level} - ${updatedItem.size}) inventory is ${updatedItem.status.toLowerCase()}. Current quantity: ${updatedItem.quantity}`;

      for (const baoUser of baoUsers) {
        await createNotification(
          baoUser._id,
          "Academic Gown Inventory Alert",
          notificationMessage
        );
      }
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update inventory item",
      error: error.message,
    });
  }
};

// @desc    Delete academic gown inventory item
// @route   DELETE /api/academic-gown-inventory/:id
// @access  Private/JobOrder
export const deleteAcademicGownInventory = async (req, res) => {
  try {
    const inventoryItem = await AcademicGownInventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await inventoryItem.deleteOne();
    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory statistics
// @route   GET /api/academic-gown-inventory/stats
// @access  Private
export const getInventoryStats = async (req, res) => {
  try {
    const { level, productType, status } = req.query;
    const query = {};

    // Apply filters if provided
    if (level) query.level = level;
    if (productType) query.productType = productType;
    if (status) query.status = status;

    // Generate inventory report
    const report = await AcademicGownInventory.generateInventoryReport(query);

    res.status(200).json({
      success: true,
      ...report
    });
  } catch (error) {
    console.error("Error in getInventoryStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory statistics",
      error: error.message,
    });
  }
};

// @desc    Update inventory quantity
// @route   PATCH /api/academic-gown-inventory/:id/quantity
// @access  Private/JobOrder
export const updateInventoryQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, action } = req.body;

    if (!["add", "subtract"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'add' or 'subtract'" });
    }

    const inventoryItem = await AcademicGownInventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Update quantity based on action
    const parsedQuantity = parseInt(quantity);
    if (action === "add") {
      inventoryItem.quantity += parsedQuantity;
    } else {
      if (inventoryItem.quantity < parsedQuantity) {
        return res.status(400).json({ message: "Insufficient quantity in inventory" });
      }
      inventoryItem.quantity -= parsedQuantity;
    }

    const updatedItem = await inventoryItem.save();

    // Check if quantity is low and notify BAO users
    if (updatedItem.status === "Low Stock" || updatedItem.status === "Out of Stock") {
      const baoUsers = await User.find({ role: "BAO", isActive: true });
      const notificationMessage = `${updatedItem.status} alert: ${updatedItem.productType} (${updatedItem.level} - ${updatedItem.size}) inventory is ${updatedItem.status.toLowerCase()}. Current quantity: ${updatedItem.quantity}`;

      for (const baoUser of baoUsers) {
        await createNotification(
          baoUser._id,
          "Academic Gown Inventory Alert",
          notificationMessage
        );
      }
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update inventory quantity",
      error: error.message,
    });
  }
}; 