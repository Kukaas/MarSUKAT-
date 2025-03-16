import express from "express";
import {
  getAllProductTypes,
  getProductTypeById,
  createProductType,
  updateProductType,
  deleteProductType,
} from "../controllers/productType.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProductTypes);
router.get("/:id", getProductTypeById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createProductType);
router.put("/:id", authenticateUser, isSuperAdmin, updateProductType);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteProductType);

export default router;
