import Department from "../models/department.model.js";

// Create a new department (Super Admin only)
export const createDepartment = async (req, res) => {
  try {
    // Super admin check is handled by middleware

    // Check if a department with the same name already exists
    const existingDepartment = await Department.findOne({
      department: req.body.department,
    });
    if (existingDepartment) {
      return res.status(400).json({
        message: "A department with this name already exists",
      });
    }

    const newDepartment = new Department({
      department: req.body.department,
      description: req.body.description,
    });

    const savedDepartment = await newDepartment.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update department (Super Admin only)
export const updateDepartment = async (req, res) => {
  try {
    // First check if the department exists
    const existingDepartment = await Department.findById(req.params.id);
    if (!existingDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Keep the existing departmentId and update other fields
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          department: req.body.department,
          description: req.body.description,
          // departmentId remains unchanged
        },
      },
      { new: true }
    );

    res.status(200).json(updatedDepartment);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid department ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete department (Super Admin only)
export const deleteDepartment = async (req, res) => {
  try {
    // Super admin check is handled by middleware
    const deletedDepartment = await Department.findByIdAndDelete(req.params.id);

    if (!deletedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid department ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
