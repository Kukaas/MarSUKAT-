import express from "express";
import {
  switchUser,
  getAvailableUsers,
  createTestOrder,
  deleteAllOrders,
  createMassOrders,
  approveAllOrders,
  deleteUser,
} from "../controllers/dev.controller.js";
import { developmentOnly } from "../middleware/dev.middleware.js";

const router = express.Router();

// Apply development-only middleware to all routes in this router
router.use(developmentOnly);

// Developer-only routes - these should only be accessible in development mode
router.post("/switch-user", switchUser);
router.get("/available-users", getAvailableUsers);
router.post("/create-test-order", createTestOrder);
router.delete("/delete-all-orders", deleteAllOrders);
router.post("/create-mass-orders", createMassOrders);
router.post("/approve-all-orders", approveAllOrders);
router.delete("/delete-user", deleteUser);

export default router;
