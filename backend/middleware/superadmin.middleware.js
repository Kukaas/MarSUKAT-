import User from "../models/user.model.js";

export const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "SuperAdmin") {
      return res
        .status(403)
        .json({ message: "Access denied. Super Admin only." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking super admin status" });
  }
};
