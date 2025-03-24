import AcademicGownType from "../models/academicGownType.model.js";
import Level from "../models/level.model.js";
import Size from "../models/size.model.js";
import Category from "../models/category.model.js";
import Unit from "../models/unit.model.js";
import RawMaterialType from "../models/rawMaterialType.model.js";

// @desc    Get all academic gown types
// @route   GET /api/academic-gown-types
// @access  Private
export const getAllAcademicGownTypes = async (req, res) => {
  try {
    const gownTypes = await AcademicGownType.find();
    res.status(200).json(gownTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get academic gown type by ID
// @route   GET /api/academic-gown-types/:id
// @access  Private
export const getAcademicGownTypeById = async (req, res) => {
  try {
    const gownType = await AcademicGownType.findById(req.params.id);
    if (!gownType) {
      return res.status(404).json({ message: "Academic gown type not found" });
    }
    res.status(200).json(gownType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new academic gown type
// @route   POST /api/academic-gown-types
// @access  Private/SuperAdmin
export const createAcademicGownType = async (req, res) => {
  try {
    // Verify if level exists
    const levelExists = await Level.findOne({ level: req.body.level });
    if (!levelExists) {
      return res.status(400).json({ message: "Invalid level specified" });
    }

    // Verify if size exists
    const sizeExists = await Size.findOne({ size: req.body.size });
    if (!sizeExists) {
      return res.status(400).json({ message: "Invalid size specified" });
    }

    // Verify raw materials
    if (req.body.rawMaterialsUsed) {
      for (const material of req.body.rawMaterialsUsed) {
        // Verify category
        const categoryExists = await Category.findOne({
          category: material.category,
        });
        if (!categoryExists) {
          return res
            .status(400)
            .json({ message: `Invalid category: ${material.category}` });
        }

        // Verify type
        const typeExists = await RawMaterialType.findOne({
          name: material.type,
        });
        if (!typeExists) {
          return res
            .status(400)
            .json({ message: `Invalid raw material type: ${material.type}` });
        }

        // Verify unit
        const unitExists = await Unit.findOne({ unit: material.unit });
        if (!unitExists) {
          return res
            .status(400)
            .json({ message: `Invalid unit: ${material.unit}` });
        }

        // Verify quantity is positive
        if (material.quantity <= 0) {
          return res.status(400).json({ message: "Quantity must be positive" });
        }
      }
    }

    const newGownType = new AcademicGownType({
      level: req.body.level,
      productType: req.body.productType,
      size: req.body.size,
      rawMaterialsUsed: req.body.rawMaterialsUsed.map((material) => ({
        ...material,
        quantity: parseFloat(material.quantity),
      })),
    });

    const savedGownType = await newGownType.save();
    res.status(201).json(savedGownType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update academic gown type
// @route   PUT /api/academic-gown-types/:id
// @access  Private/SuperAdmin
export const updateAcademicGownType = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "Academic gown type ID is required" });
    }

    const gownType = await AcademicGownType.findById(id);
    if (!gownType) {
      return res.status(404).json({ message: "Academic gown type not found" });
    }

    // Update the gown type fields
    Object.assign(gownType, updates);
    const updatedGownType = await gownType.save();

    res.status(200).json(updatedGownType);
  } catch (error) {
    console.error("Error updating academic gown type:", error);
    res
      .status(500)
      .json({ message: "Failed to update academic gown type", error: error.message });
  }
};

// @desc    Delete academic gown type
// @route   DELETE /api/academic-gown-types/:id
// @access  Private/SuperAdmin
export const deleteAcademicGownType = async (req, res) => {
  try {
    const gownType = await AcademicGownType.findById(req.params.id);
    if (!gownType) {
      return res.status(404).json({ message: "Academic gown type not found" });
    }

    await gownType.deleteOne();
    res.status(200).json({ message: "Academic gown type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 