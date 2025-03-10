import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Add user info to request object
    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

// Middleware to check if user has specific role
export const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
