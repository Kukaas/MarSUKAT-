import express from "express";
import {
  createPrice,
  getAllPrices,
  getPriceById,
  updatePrice,
  deletePrice,
} from "../controllers/price.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllPrices);
router.get("/:id", getPriceById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createPrice);
router.put("/:id", authenticateUser, isSuperAdmin, updatePrice);
router.delete("/:id", authenticateUser, isSuperAdmin, deletePrice);

export default router;
