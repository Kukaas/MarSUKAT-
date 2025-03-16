import UniformInventory from "../models/uniformInventory.model.js";

// @desc    Get all uniform inventory items
// @route   GET /api/uniform-inventory
// @access  Private
export const getAllUniformInventory = async (req, res) => {
  try {
    const inventory = await UniformInventory.find().sort({ createdAt: -1 });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get uniform inventory by ID
// @route   GET /api/uniform-inventory/:id
// @access  Private
export const getUniformInventoryById = async (req, res) => {
  try {
    const inventory = await UniformInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get uniform inventory by level
// @route   GET /api/uniform-inventory/level/:level
// @access  Private
export const getUniformInventoryByLevel = async (req, res) => {
  try {
    const inventory = await UniformInventory.find({
      level: req.params.level,
    }).sort({ createdAt: -1 });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new uniform inventory item
// @route   POST /api/uniform-inventory
// @access  Private/Admin
export const createUniformInventory = async (req, res) => {
  try {
    const { level, productType, size, quantity, price, status, image } =
      req.body;

    const newInventory = new UniformInventory({
      level,
      productType,
      size,
      quantity,
      price,
      status,
      image: image || undefined,
    });

    const savedInventory = await newInventory.save();
    res.status(201).json(savedInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update uniform inventory
// @route   PUT /api/uniform-inventory/:id
// @access  Private/Admin
export const updateUniformInventory = async (req, res) => {
  try {
    const inventoryToUpdate = await UniformInventory.findById(req.params.id);
    if (!inventoryToUpdate) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const { level, productType, size, quantity, price, status, image } =
      req.body;

    inventoryToUpdate.level = level || inventoryToUpdate.level;
    inventoryToUpdate.productType =
      productType || inventoryToUpdate.productType;
    inventoryToUpdate.size = size || inventoryToUpdate.size;
    inventoryToUpdate.quantity =
      quantity !== undefined ? quantity : inventoryToUpdate.quantity;
    inventoryToUpdate.price =
      price !== undefined ? price : inventoryToUpdate.price;
    inventoryToUpdate.status = status || inventoryToUpdate.status;
    if (image) {
      inventoryToUpdate.image = image;
    }

    const updatedInventory = await inventoryToUpdate.save();
    res.status(200).json(updatedInventory);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete uniform inventory
// @route   DELETE /api/uniform-inventory/:id
// @access  Private/Admin
export const deleteUniformInventory = async (req, res) => {
  try {
    const inventory = await UniformInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await inventory.deleteOne();
    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
