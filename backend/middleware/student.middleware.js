export const isStudent = (req, res, next) => {
  // Check if user exists and is authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check if user is a student
  if (req.user.role !== "Student") {
    return res.status(403).json({ message: "Student access required" });
  }

  next();
};
