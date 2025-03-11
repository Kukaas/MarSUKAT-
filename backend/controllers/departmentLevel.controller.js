import DepartmentLevel from "../models/departmentLevel.model.js";
import Department from "../models/department.model.js";
import Level from "../models/level.model.js";

// Create a new department-level combination
export const createDepartmentLevel = async (req, res) => {
  try {
    const { departmentId, levelId } = req.body;

    // Verify department and level exist
    const department = await Department.findById(departmentId);
    const level = await Level.findById(levelId);

    if (!department || !level) {
      return res.status(404).json({
        success: false,
        message: "Department or Level not found",
      });
    }

    const departmentLevel = await DepartmentLevel.create({
      department: departmentId,
      level: levelId,
    });

    res.status(201).json({
      success: true,
      data: departmentLevel,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This department-level combination already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all department-level combinations
export const getAllDepartmentLevels = async (req, res) => {
  try {
    const departmentLevels = await DepartmentLevel.find()
      .populate("department", "department departmentId")
      .populate("level", "level levelId");

    res.status(200).json({
      success: true,
      data: departmentLevels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active department-level combinations
export const getActiveDepartmentLevels = async (req, res) => {
  try {
    const departmentLevels = await DepartmentLevel.find({ isActive: true })
      .populate("department", "department departmentId")
      .populate("level", "level levelId");

    res.status(200).json({
      success: true,
      data: departmentLevels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update department-level combination status
export const updateDepartmentLevelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const departmentLevel = await DepartmentLevel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!departmentLevel) {
      return res.status(404).json({
        success: false,
        message: "Department-Level combination not found",
      });
    }

    res.status(200).json({
      success: true,
      data: departmentLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete department-level combination
export const deleteDepartmentLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentLevel = await DepartmentLevel.findByIdAndDelete(id);

    if (!departmentLevel) {
      return res.status(404).json({
        success: false,
        message: "Department-Level combination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department-Level combination deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update department-level combination
export const updateDepartmentLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, levelId } = req.body;

    // Verify department and level exist
    const department = await Department.findById(departmentId);
    const level = await Level.findById(levelId);

    if (!department || !level) {
      return res.status(404).json({
        success: false,
        message: "Department or Level not found",
      });
    }

    // Check if the combination already exists for a different record
    const existingCombination = await DepartmentLevel.findOne({
      _id: { $ne: id },
      department: departmentId,
      level: levelId,
    });

    if (existingCombination) {
      return res.status(400).json({
        success: false,
        message: "This department-level combination already exists",
      });
    }

    const departmentLevel = await DepartmentLevel.findByIdAndUpdate(
      id,
      {
        department: departmentId,
        level: levelId,
      },
      { new: true }
    ).populate("department level");

    if (!departmentLevel) {
      return res.status(404).json({
        success: false,
        message: "Department-Level combination not found",
      });
    }

    res.status(200).json({
      success: true,
      data: departmentLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
