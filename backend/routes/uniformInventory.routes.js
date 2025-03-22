import express from "express";
import {
  createUniformInventory,
  getAllUniformInventory,
  getUniformInventoryById,
  getUniformInventoryByLevel,
  updateUniformInventory,
  deleteUniformInventory,
} from "../controllers/uniformInventory.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { isJobOrder } from "../middleware/jobOrder.middleware.js";
import { isBAO } from "../middleware/bao.middleware.js";

const router = express.Router();

// Helper middleware to check if user has either BAO or JobOrder role
const isBAOOrJobOrder = (req, res, next) => {
  // Try BAO middleware first
  isBAO(req, res, (err) => {
    if (!err) {
      return next();
    }
    // If BAO fails, try JobOrder middleware
    isJobOrder(req, res, (err) => {
      if (!err) {
        return next();
      }
      // If both fail, return error
      res.status(403).json({
        message: "Access denied. Requires BAO or JobOrder role.",
        error: "Insufficient permissions",
        currentRole: req.user?.role,
        expectedRoles: ["BAO", "JobOrder"],
        isActive: req.user?.isActive,
      });
    });
  });
};

// Protected routes - requires either BAO or JobOrder role for viewing
router.get("/", authenticateUser, isBAOOrJobOrder, getAllUniformInventory);
router.get("/level/:level", authenticateUser, isBAOOrJobOrder, getUniformInventoryByLevel);
router.get("/:id", authenticateUser, isBAOOrJobOrder, getUniformInventoryById);

// Protected routes - requires JobOrder role for modifications
router.post("/", authenticateUser, isJobOrder, createUniformInventory);
router.put("/:id", authenticateUser, isJobOrder, updateUniformInventory);
router.delete("/:id", authenticateUser, isJobOrder, deleteUniformInventory);

export default router;
