import RawMaterialInventory from "../models/rawMaterialInventory.model.js";

// @desc    Get all raw material inventory items
// @route   GET /api/raw-material-inventory
// @access  Private
export const getAllRawMaterialInventory = async (req, res) => {
  try {
    const inventory = await RawMaterialInventory.find()
      .populate("rawMaterialType", "name description")
      .sort({ createdAt: -1 });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get raw material inventory by ID
// @route   GET /api/raw-material-inventory/:id
// @access  Private
export const getRawMaterialInventoryById = async (req, res) => {
  try {
    const inventory = await RawMaterialInventory.findById(
      req.params.id
    ).populate("rawMaterialType", "name description");
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get raw material inventory by category
// @route   GET /api/raw-material-inventory/category/:category
// @access  Private
export const getRawMaterialInventoryByCategory = async (req, res) => {
  try {
    const inventory = await RawMaterialInventory.find({
      category: req.params.category,
    })
      .populate("rawMaterialType", "name description")
      .sort({ createdAt: -1 });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new raw material inventory item
// @route   POST /api/raw-material-inventory
// @access  Private/SuperAdmin
export const createRawMaterialInventory = async (req, res) => {
  try {
    const { category, rawMaterialType, unit, quantity, status, image } =
      req.body;

    const newInventory = new RawMaterialInventory({
      category,
      rawMaterialType,
      unit,
      quantity,
      status,
      image: image || undefined,
    });

    const savedInventory = await newInventory.save();
    const populatedInventory = await RawMaterialInventory.findById(
      savedInventory._id
    ).populate("rawMaterialType", "name description");

    res.status(201).json(populatedInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update raw material inventory
// @route   PUT /api/raw-material-inventory/:id
// @access  Private/SuperAdmin
export const updateRawMaterialInventory = async (req, res) => {
  try {
    const inventoryToUpdate = await RawMaterialInventory.findById(
      req.params.id
    );
    if (!inventoryToUpdate) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const { category, rawMaterialType, unit, quantity, status, image } =
      req.body;

    inventoryToUpdate.category = category || inventoryToUpdate.category;
    inventoryToUpdate.rawMaterialType =
      rawMaterialType || inventoryToUpdate.rawMaterialType;
    inventoryToUpdate.unit = unit || inventoryToUpdate.unit;
    inventoryToUpdate.quantity =
      quantity !== undefined ? quantity : inventoryToUpdate.quantity;
    inventoryToUpdate.status = status || inventoryToUpdate.status;
    if (image) {
      inventoryToUpdate.image = image;
    }

    const updatedInventory = await inventoryToUpdate.save();
    const populatedInventory = await RawMaterialInventory.findById(
      updatedInventory._id
    ).populate("rawMaterialType", "name description");

    res.status(200).json(populatedInventory);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete raw material inventory
// @route   DELETE /api/raw-material-inventory/:id
// @access  Private/SuperAdmin
export const deleteRawMaterialInventory = async (req, res) => {
  try {
    const inventory = await RawMaterialInventory.findById(req.params.id);
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
