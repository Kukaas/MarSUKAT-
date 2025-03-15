import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

/**
 * Developer-only endpoint to switch between user accounts
 * This should ONLY be enabled in development environments
 */
export const switchUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Create access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to false in development
      sameSite: "strict",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    };

    // Set refresh token cookie
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Set access token cookie
    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    res.status(200).json({
      message: `Successfully switched to user: ${user.name} (${user.role})`,
      user,
    });
  } catch (error) {
    console.error("Dev switch user error:", error);
    res.status(500).json({
      message: "An error occurred while switching users",
      error: error.message,
    });
  }
};

/**
 * Get a list of available users for switching
 * This should ONLY be enabled in development environments
 */
export const getAvailableUsers = async (req, res) => {
  try {
    // Get a list of users with minimal information
    const users = await User.find()
      .select("email name role")
      .sort({ role: 1, name: 1 })
      .limit(20);

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Dev get users error:", error);
    res.status(500).json({
      message: "An error occurred while fetching available users",
      error: error.message,
    });
  }
};
