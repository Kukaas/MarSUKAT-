import express from "express";
import { createSuperAdmin } from "../controllers/superAdmin.controller.js";

const router = express.Router();

// Create super admin route (this should be protected in production)
router.post("/create", createSuperAdmin);

export default router;
