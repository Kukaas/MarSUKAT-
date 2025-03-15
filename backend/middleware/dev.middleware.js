/**
 * Middleware to ensure routes are only accessible in development mode
 */
export const developmentOnly = (req, res, next) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({
      message: "This endpoint is only available in development mode",
    });
  }
  next();
};
