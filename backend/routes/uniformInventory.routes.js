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

const router = express.Router();

// Public routes - only requires authentication
router.get("/", authenticateUser, getAllUniformInventory);
router.get("/level/:level", authenticateUser, getUniformInventoryByLevel);
router.get("/:id", authenticateUser, getUniformInventoryById);
router.post("/", authenticateUser, createUniformInventory);
router.put("/:id", authenticateUser, updateUniformInventory);
router.delete("/:id", authenticateUser, deleteUniformInventory);

export default router;
