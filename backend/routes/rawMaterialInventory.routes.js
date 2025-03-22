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

const router = express.Router();

// Public routes - only requires authentication
router.get("/", authenticateUser, getAllRawMaterialInventory);
router.get("/category/:category", authenticateUser, getRawMaterialInventoryByCategory);
router.get("/:id", authenticateUser, getRawMaterialInventoryById);
router.post("/", authenticateUser, createRawMaterialInventory);
router.put("/:id", authenticateUser, updateRawMaterialInventory);
router.delete("/:id", authenticateUser, deleteRawMaterialInventory);

export default router;
