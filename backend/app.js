import studentOrderRoutes from "./routes/studentOrder.routes.js";
import salesReportRoutes from "./routes/salesReport.routes.js";

// Routes
app.use("/api/student-orders", studentOrderRoutes);
app.use("/api/sales-reports", salesReportRoutes); 