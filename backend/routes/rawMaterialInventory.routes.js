import express from "express";
import {
  createRawMaterialInventory,
  getAllRawMaterialInventory,
  getRawMaterialInventoryById,
  getRawMaterialInventoryByCategory,
  updateRawMaterialInventory,
  deleteRawMaterialInventory,
} from "../controllers/rawMaterialInventory.controller.js";
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

// Protected routes - requires either BAO or JobOrder role
router.get("/", authenticateUser, isBAOOrJobOrder, getAllRawMaterialInventory);
router.get("/category/:category", authenticateUser, isBAOOrJobOrder, getRawMaterialInventoryByCategory);
router.get("/:id", authenticateUser, isBAOOrJobOrder, getRawMaterialInventoryById);
router.post("/", authenticateUser, isBAOOrJobOrder, createRawMaterialInventory);
router.put("/:id", authenticateUser, isBAOOrJobOrder, updateRawMaterialInventory);
router.delete("/:id", authenticateUser, isBAOOrJobOrder, deleteRawMaterialInventory);

export default router;
