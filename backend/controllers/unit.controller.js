import Unit from "../models/unit.model.js";

// @desc    Get all units
// @route   GET /api/units
// @access  Private
export const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unit by ID
// @route   GET /api/units/:id
// @access  Private
export const getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }
    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new unit
// @route   POST /api/units
// @access  Private/SuperAdmin
export const createUnit = async (req, res) => {
  try {
    // Super admin check is handled by middleware

    // Check if a unit with the same name already exists
    const duplicateCheck = await Unit.findOne({ unit: req.body.unit });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "A unit with this name already exists",
      });
    }

    const newUnit = new Unit({
      unit: req.body.unit,
    });

    const savedUnit = await newUnit.save();
    res.status(201).json(savedUnit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update unit
// @route   PUT /api/units/:id
// @access  Private/SuperAdmin
export const updateUnit = async (req, res) => {
  try {
    // First check if the unit exists
    const unitToUpdate = await Unit.findById(req.params.id);
    if (!unitToUpdate) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // Check if the updated unit name already exists
    const duplicateCheck = await Unit.findOne({
      unit: req.body.unit,
      _id: { $ne: req.params.id },
    });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "A unit with this name already exists",
      });
    }

    // Update unit
    unitToUpdate.unit = req.body.unit;
    const updatedUnit = await unitToUpdate.save();
    res.status(200).json(updatedUnit);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid unit ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete unit
// @route   DELETE /api/units/:id
// @access  Private/SuperAdmin
export const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    await unit.deleteOne();
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid unit ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
