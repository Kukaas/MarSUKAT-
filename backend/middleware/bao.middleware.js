export const isBAO = (req, res, next) => {
    // Development bypass
    if (process.env.NODE_ENV === "development" && req.user?.isDevOverride) {
      return next();
    }
  
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
      req.user.role?.toLowerCase() === "bao" &&
      (req.user.isActive === undefined || req.user.isActive === true)
    ) {
      next();
    } else {
      res.status(403).json({
        message: "Access denied. Bao role required.",
        error:
          req.user.isActive === false
            ? "Account is currently deactivated"
            : "Insufficient permissions",
        currentRole: req.user.role,
        expectedRole: "BAO",
        isActive: req.user.isActive,
      });
    }
  };
  