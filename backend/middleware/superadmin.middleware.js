export const isSuperAdmin = (req, res, next) => {
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
