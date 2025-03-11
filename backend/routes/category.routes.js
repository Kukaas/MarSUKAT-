import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { isSuperAdmin } from "../middleware/superAdmin.middleware.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Super Admin only routes
router.post("/", authenticateUser, isSuperAdmin, createCategory);
router.put("/:id", authenticateUser, isSuperAdmin, updateCategory);
router.delete("/:id", authenticateUser, isSuperAdmin, deleteCategory);

export default router;
