import RawMaterialType from "../models/rawMaterialType.model.js";

// @desc    Get all raw material types
// @route   GET /api/raw-material-types
// @access  Private
export const getAllRawMaterialTypes = async (req, res) => {
  try {
    const types = await RawMaterialType.find();
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get raw material types by category
// @route   GET /api/raw-material-types/category/:category
// @access  Private
export const getRawMaterialTypesByCategory = async (req, res) => {
  try {
    console.log("Fetching types for category:", req.params.category);
    const types = await RawMaterialType.find({ category: req.params.category });
    console.log("Found types:", types);
    res.status(200).json(types);
  } catch (error) {
    console.error("Error in getRawMaterialTypesByCategory:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get raw material type by ID
// @route   GET /api/raw-material-types/:id
// @access  Private
export const getRawMaterialTypeById = async (req, res) => {
  try {
    const type = await RawMaterialType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: "Raw material type not found" });
    }
    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new raw material type
// @route   POST /api/raw-material-types
// @access  Private/SuperAdmin
export const createRawMaterialType = async (req, res) => {
  try {
    // Check if a type with the same name already exists
    const duplicateCheck = await RawMaterialType.findOne({
      name: req.body.name,
    });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "A raw material type with this name already exists",
      });
    }

    const newType = new RawMaterialType({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      unit: req.body.unit,
    });

    const savedType = await newType.save();
    res.status(201).json(savedType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update raw material type
// @route   PUT /api/raw-material-types/:id
// @access  Private/SuperAdmin
export const updateRawMaterialType = async (req, res) => {
  try {
    const typeToUpdate = await RawMaterialType.findById(req.params.id);
    if (!typeToUpdate) {
      return res.status(404).json({ message: "Raw material type not found" });
    }

    // Check if the updated name already exists
    const duplicateCheck = await RawMaterialType.findOne({
      name: req.body.name,
      _id: { $ne: req.params.id },
    });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "A raw material type with this name already exists",
      });
    }

    typeToUpdate.name = req.body.name;
    typeToUpdate.description = req.body.description;
    typeToUpdate.category = req.body.category;
    typeToUpdate.unit = req.body.unit;

    const updatedType = await typeToUpdate.save();
    res.status(200).json(updatedType);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete raw material type
// @route   DELETE /api/raw-material-types/:id
// @access  Private/SuperAdmin
export const deleteRawMaterialType = async (req, res) => {
  try {
    const type = await RawMaterialType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ message: "Raw material type not found" });
    }

    await type.deleteOne();
    res.status(200).json({ message: "Raw material type deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
