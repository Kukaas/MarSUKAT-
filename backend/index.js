import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
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
import rawMaterialInventoryRoutes from "./routes/rawMaterialInventory.routes.js";
import productTypeRoutes from "./routes/productType.routes.js";
import userRoutes from "./routes/user.routes.js";
import devRoutes from "./routes/dev.routes.js";
import uniformInventoryRoutes from "./routes/uniformInventory.routes.js";
import schoolUniformProductionRoutes from "./routes/schoolUniformProduction.routes.js";
import productRoutes from "./routes/product.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import studentOrderRoutes from "./routes/studentOrder.routes.js";
import salesReportRoutes from "./routes/salesReport.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import academicGownTypeRoutes from "./routes/academicGownType.routes.js";
import academicGownInventoryRoutes from "./routes/academicGownInventory.routes.js";
import academicGownProductionRoutes from "./routes/academicGownProduction.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import accomplishmentReportRoutes from "./routes/accomplishmentReport.routes.js";
import contactRoutes from "./routes/contact.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.100.39:5173",
      "http://192.168.100.39:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://marsukat.vercel.app"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Headers']
  })
);

// Rate limiting middleware to prevent abuse of the API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.'
});

// Apply rate limiter only for POST and PUT requests
app.use('/api/v1', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    limiter(req, res, next);
  } else {
    next();
  }
});

// Increase payload size limit to 10MB
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
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
app.use("/api/v1/raw-material-inventory", rawMaterialInventoryRoutes);
app.use("/api/v1/product-types", productTypeRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/uniform-inventory", uniformInventoryRoutes);
app.use("/api/v1/school-uniform-productions", schoolUniformProductionRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/student-orders", studentOrderRoutes);
app.use("/api/v1/sales-reports", salesReportRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/academic-gown-types", academicGownTypeRoutes);
app.use("/api/v1/academic-gown-inventory", academicGownInventoryRoutes);
app.use("/api/v1/academic-gown-productions", academicGownProductionRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/accomplishment-reports", accomplishmentReportRoutes);
app.use("/api/v1/contact", contactRoutes);

// Developer routes - only enabled in development mode
if (process.env.NODE_ENV === "development") {
  app.use("/api/v1/dev", devRoutes);
  console.log("⚠️ Developer routes enabled - DO NOT USE IN PRODUCTION ⚠️");
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Only start the server if we're not in a Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
