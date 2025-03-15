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

const router = express.Router();

// Protected routes - requires JobOrder role
router.get("/", authenticateUser, isJobOrder, getAllRawMaterialInventory);
router.get(
  "/category/:category",
  authenticateUser,
  isJobOrder,
  getRawMaterialInventoryByCategory
);
router.get("/:id", authenticateUser, isJobOrder, getRawMaterialInventoryById);
router.post("/", authenticateUser, isJobOrder, createRawMaterialInventory);
router.put("/:id", authenticateUser, isJobOrder, updateRawMaterialInventory);
router.delete("/:id", authenticateUser, isJobOrder, deleteRawMaterialInventory);

export default router;
