import SalesReport from "../models/salesReport.model.js";
import StudentOrder from "../models/studentOrder.model.js";

// @desc    Create sales report from claimed order
// @route   POST /api/sales-reports
// @access  Private/JobOrder
export const createSalesReport = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await StudentOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Claimed") {
      return res.status(400).json({ message: "Order must be claimed to create sales report" });
    }

    // Check if sales report already exists
    const existingReport = await SalesReport.findOne({ orderId });
    if (existingReport) {
      return res.status(400).json({ message: "Sales report already exists for this order" });
    }

    // Create sales report
    const salesReport = new SalesReport({
      orderId: order.orderId,
      studentName: order.name,
      studentNumber: order.studentNumber,
      department: order.department,
      orderItems: order.orderItems.map(item => ({
        ...item.toObject(),
        subtotal: item.unitPrice * item.quantity
      })),
      totalAmount: order.totalPrice,
      dateClaimed: new Date(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });

    const savedReport = await salesReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    console.error("Error creating sales report:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all sales reports
// @route   GET /api/sales-reports
// @access  Private/JobOrder
export const getAllSalesReports = async (req, res) => {
  try {
    const reports = await SalesReport.find().sort({ dateClaimed: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales report by ID
// @route   GET /api/sales-reports/:id
// @access  Private/JobOrder
export const getSalesReportById = async (req, res) => {
  try {
    const report = await SalesReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Sales report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly sales summary
// @route   GET /api/sales-reports/summary/monthly
// @access  Private/JobOrder
export const getMonthlySalesSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const query = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = parseInt(month);

    const reports = await SalesReport.find(query);
    
    // Get all months data for the selected year
    const monthlyData = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const monthReports = await SalesReport.find({
          year: parseInt(year),
          month: i + 1
        });
        return {
          month: i + 1,
          sales: monthReports.reduce((sum, report) => sum + report.totalAmount, 0)
        };
      })
    );

    const summary = {
      totalSales: reports.reduce((sum, report) => sum + report.totalAmount, 0),
      totalOrders: reports.length,
      averageOrderValue: reports.length > 0 
        ? reports.reduce((sum, report) => sum + report.totalAmount, 0) / reports.length 
        : 0,
      monthlyData,
      departmentBreakdown: {},
      productTypeBreakdown: {}
    };

    // Calculate department breakdown
    reports.forEach(report => {
      if (!summary.departmentBreakdown[report.department]) {
        summary.departmentBreakdown[report.department] = {
          totalSales: 0,
          orderCount: 0
        };
      }
      summary.departmentBreakdown[report.department].totalSales += report.totalAmount;
      summary.departmentBreakdown[report.department].orderCount += 1;
    });

    // Transform department breakdown for the chart
    summary.department = Object.entries(summary.departmentBreakdown).map(([name, data]) => ({
      name,
      totalSales: data.totalSales,
      orderCount: data.orderCount
    }));

    // Calculate product type breakdown
    reports.forEach(report => {
      report.orderItems.forEach(item => {
        if (!summary.productTypeBreakdown[item.productType]) {
          summary.productTypeBreakdown[item.productType] = {
            totalSales: 0,
            quantity: 0
          };
        }
        summary.productTypeBreakdown[item.productType].totalSales += item.subtotal;
        summary.productTypeBreakdown[item.productType].quantity += item.quantity;
      });
    });

    // Transform product type breakdown for the chart
    summary.productType = Object.entries(summary.productTypeBreakdown).map(([name, data]) => ({
      name,
      totalSales: data.totalSales,
      quantity: data.quantity
    }));

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get yearly sales summary
// @route   GET /api/sales-reports/summary/yearly
// @access  Private/JobOrder
export const getYearlySalesSummary = async (req, res) => {
  try {
    const { year } = req.query;
    
    const reports = await SalesReport.find({ year: parseInt(year) });

    const summary = {
      totalSales: reports.reduce((sum, report) => sum + report.totalAmount, 0),
      totalOrders: reports.length,
      averageOrderValue: reports.length > 0 
        ? reports.reduce((sum, report) => sum + report.totalAmount, 0) / reports.length 
        : 0,
      departmentBreakdown: {},
      productTypeBreakdown: {}
    };

    // Calculate department breakdown
    reports.forEach(report => {
      if (!summary.departmentBreakdown[report.department]) {
        summary.departmentBreakdown[report.department] = {
          totalSales: 0,
          orderCount: 0
        };
      }
      summary.departmentBreakdown[report.department].totalSales += report.totalAmount;
      summary.departmentBreakdown[report.department].orderCount += 1;
    });

    // Transform department breakdown for the chart
    summary.department = Object.entries(summary.departmentBreakdown).map(([name, data]) => ({
      name,
      totalSales: data.totalSales,
      orderCount: data.orderCount
    }));

    // Calculate product type breakdown
    reports.forEach(report => {
      report.orderItems.forEach(item => {
        if (!summary.productTypeBreakdown[item.productType]) {
          summary.productTypeBreakdown[item.productType] = {
            totalSales: 0,
            quantity: 0
          };
        }
        summary.productTypeBreakdown[item.productType].totalSales += item.subtotal;
        summary.productTypeBreakdown[item.productType].quantity += item.quantity;
      });
    });

    // Transform product type breakdown for the chart
    summary.productType = Object.entries(summary.productTypeBreakdown).map(([name, data]) => ({
      name,
      totalSales: data.totalSales,
      quantity: data.quantity
    }));

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 