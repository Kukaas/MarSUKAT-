import Employee from "../models/employee.model.js";

// Marinduque municipalities
const MARINDUQUE_MUNICIPALITIES = [
  "Boac",
  "Buenavista",
  "Gasan",
  "Mogpog",
  "Santa Cruz",
  "Torrijos"
];

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active employees only
// @route   GET /api/employees/active
// @access  Private
export const getActiveEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
export const createEmployee = async (req, res) => {
  try {
    const { name, email, contactNumber, positions, municipality, barangay} = req.body;
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate contact number (Philippine format)
    const contactRegex = /^(\+63|0)[\d]{10}$/;
    if (!contactRegex.test(req.body.contactNumber)) {
      return res.status(400).json({ 
        message: "Invalid contact number format. Use +63 or 0 followed by 10 digits" 
      });
    }

    // Validate municipality
    if (!MARINDUQUE_MUNICIPALITIES.includes(req.body.municipality)) {
      return res.status(400).json({ 
        message: "Invalid municipality. Must be one of: " + MARINDUQUE_MUNICIPALITIES.join(", ") 
      });
    }

    // Check if employee with same email exists
    const duplicateCheck = await Employee.findOne({ email: req.body.email });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "An employee with this email already exists",
      });
    }

    const newEmployee = new Employee({
      name,
      email,
      contactNumber,
      positions,
      municipality,
      barangay,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Validate email if it's being updated
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check for duplicate email
      const duplicateCheck = await Employee.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id },
      });
      if (duplicateCheck) {
        return res.status(400).json({
          message: "An employee with this email already exists",
        });
      }
    }

    // Validate contact number if it's being updated
    if (req.body.contactNumber) {
      const contactRegex = /^(\+63|0)[\d]{10}$/;
      if (!contactRegex.test(req.body.contactNumber)) {
        return res.status(400).json({ 
          message: "Invalid contact number format. Use +63 or 0 followed by 10 digits" 
        });
      }
    }

    // Validate municipality if it's being updated
    if (req.body.municipality && !MARINDUQUE_MUNICIPALITIES.includes(req.body.municipality)) {
      return res.status(400).json({ 
        message: "Invalid municipality. Must be one of: " + MARINDUQUE_MUNICIPALITIES.join(", ") 
      });
    }

    // Update fields
    if (req.body.name) employee.name = req.body.name;
    if (req.body.email) employee.email = req.body.email;
    if (req.body.contactNumber) employee.contactNumber = req.body.contactNumber;
    if (req.body.positions) employee.positions = req.body.positions;
    if (req.body.municipality) employee.municipality = req.body.municipality;
    if (req.body.barangay) employee.barangay = req.body.barangay;

    const updatedEmployee = await employee.save();
    res.status(200).json(updatedEmployee);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee status
// @route   PATCH /api/employees/:id/status
// @access  Private
export const updateEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.isActive = req.body.isActive;
    const updatedEmployee = await employee.save();
    
    res.status(200).json(updatedEmployee);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.deleteOne();
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }
    res.status(500).json({ message: error.message });
  }
}; 