export const isSuperAdmin = (req, res, next) => {
  // Check for development bypass headers
  if (
    process.env.NODE_ENV === "development" &&
    req.headers["x-dev-override"] === "true" &&
    req.headers["x-dev-is-superadmin"] === "true"
  ) {
    return next();
  }

  // Check if user exists and is authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check if user is a super admin
  if (req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Super Admin access required" });
  }

  next();
};
