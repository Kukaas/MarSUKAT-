export const isJobOrder = (req, res, next) => {
  // Check if user exists and has the correct role
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
      error: "No user found in request",
    });
  }

  // Check if user has JobOrder role (case-insensitive)
  // Consider user active if isActive is undefined or true
  if (
    req.user.role?.toLowerCase() === "joborder" &&
    (req.user.isActive === undefined || req.user.isActive === true)
  ) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. JobOrder role required.",
      error:
        req.user.isActive === false
          ? "Account is currently deactivated"
          : "Insufficient permissions",
      currentRole: req.user.role,
      expectedRole: "JobOrder",
      isActive: req.user.isActive,
    });
  }
};
