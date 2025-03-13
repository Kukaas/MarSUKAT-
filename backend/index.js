import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import superAdminRoutes from "./routes/superadmin.routes.js";
import levelRoutes from "./routes/level.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import departmentLevelRoutes from "./routes/departmentLevel.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import unitRoutes from "./routes/unit.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import sizeRoutes from "./routes/size.routes.js";
import priceRoutes from "./routes/price.routes.js";
import rawMaterialTypeRoutes from "./routes/rawMaterialType.routes.js";
import productTypeRoutes from "./routes/productType.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow credentials (cookies)
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/superadmin", superAdminRoutes);
app.use("/api/v1/levels", levelRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/department-levels", departmentLevelRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/sizes", sizeRoutes);
app.use("/api/v1/prices", priceRoutes);
app.use("/api/v1/raw-material-types", rawMaterialTypeRoutes);
app.use("/api/v1/product-types", productTypeRoutes);
app.use("/api/v1/users", userRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
