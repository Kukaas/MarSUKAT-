import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateUser = async (req, res, next) => {
  // Development bypass
  if (
    process.env.NODE_ENV === "development" &&
    req.headers["x-dev-override"] === "true"
  ) {
    // For development testing, bypass authentication
    req.user = {
      id: "dev-user",
      email: "dev@example.com",
      roles: req.headers["x-dev-roles"]?.split(",") || ["admin"],
      isDevOverride: true,
    };
    return next();
  }

  try {
    // Get token from cookie
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verify token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Add user info to request object
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    // Clear the invalid cookie
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    });

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired, please login again",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.message === "JWT_SECRET is not configured") {
      return res.status(500).json({
        message: "Server configuration error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    return res.status(401).json({
      message: "Invalid authentication token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
