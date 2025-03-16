import express from "express";
import {
  createProduct,
  getAllProducts,
  getAllActiveProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  activateProduct,
  deactivateProduct,
} from "../controllers/product.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";

const router = express.Router();

// Public route
router.get("/active", getAllActiveProducts);

// Protected routes - requires SuperAdmin role
router.get("/", authenticateUser, isSuperAdmin, getAllProducts);
router.get("/:id", authenticateUser, isSuperAdmin, getProductById);
router.post("/", authenticateUser, isSuperAdmin, createProduct);
router.put("/:id", authenticateUser, isSuperAdmin, updateProduct);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteProduct);
router.patch("/:id/activate", authenticateUser, isSuperAdmin, activateProduct);
router.patch(
  "/:id/deactivate",
  authenticateUser,
  isSuperAdmin,
  deactivateProduct
);

export default router;
