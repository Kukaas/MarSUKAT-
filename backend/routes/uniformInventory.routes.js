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

const router = express.Router();

// Protected routes - requires JobOrder role
router.get("/", authenticateUser, isJobOrder, getAllUniformInventory);
router.get(
  "/level/:level",
  authenticateUser,
  isJobOrder,
  getUniformInventoryByLevel
);
router.get("/:id", authenticateUser, isJobOrder, getUniformInventoryById);
router.post("/", authenticateUser, isJobOrder, createUniformInventory);
router.put("/:id", authenticateUser, isJobOrder, updateUniformInventory);
router.delete("/:id", authenticateUser, isJobOrder, deleteUniformInventory);

export default router;
