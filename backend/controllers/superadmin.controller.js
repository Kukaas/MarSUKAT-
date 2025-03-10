import bcrypt from "bcryptjs";
import User, { SuperAdmin } from "../models/user.model.js";

export const createSuperAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "SuperAdmin" });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: "Super Admin already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin
    const superAdmin = new SuperAdmin({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
      verified: true, // Super admin is verified by default
    });

    const savedSuperAdmin = await superAdmin.save();

    res.status(201).json({
      message: "Super Admin created successfully",
      userId: savedSuperAdmin._id,
    });
  } catch (error) {
    console.error("Super Admin creation error:", error);
    res
      .status(500)
      .json({ message: "Error creating Super Admin", error: error.message });
  }
};
