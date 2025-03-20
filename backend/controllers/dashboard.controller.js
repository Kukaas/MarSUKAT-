import UniformInventory from "../models/uniformInventory.model.js";
import RawMaterialInventory from "../models/rawMaterialInventory.model.js";
import SchoolUniformProduction from "../models/schoolUniformProduction.model.js";
import SalesReport from "../models/salesReport.model.js";
import StudentOrder from "../models/studentOrder.model.js";

// @desc    Get dashboard overview data
// @route   GET /api/dashboard/overview
// @access  Private/JobOrder
export const getDashboardOverview = async (req, res) => {
  try {
    const { timeframe, year, month, week } = req.query;
    
    // Convert parameters to integers
    const yearInt = parseInt(year || new Date().getFullYear());
    const monthInt = parseInt(month || (new Date().getMonth() + 1));
    
    // Get start and end dates for query filtering
    const dateFilter = getDateFilterByTimeframe(timeframe, yearInt, monthInt, week);
    
    // Fetch production data
    const productionData = await getProductionOverview(dateFilter);
    
    // Fetch sales data
    const salesData = await getSalesOverview(dateFilter);
    
    // Fetch inventory levels
    const inventoryLevels = await getInventoryLevels();
    
    // Fetch total revenue for the specified period
    const totalRevenue = await getTotalRevenue(dateFilter);
    
    res.status(200).json({
      production: productionData,
      sales: salesData,
      inventory: inventoryLevels,
      revenue: totalRevenue
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get date filter based on timeframe
const getDateFilterByTimeframe = (timeframe, year, month, week) => {
  const filter = {};
  
  // Default to current month if no timeframe specified
  if (!timeframe || timeframe === 'month') {
    // Monthly filter
    filter.start = new Date(year, month - 1, 1);
    filter.end = new Date(year, month, 0); // Last day of the month
  } else if (timeframe === 'year') {
    // Yearly filter
    filter.start = new Date(year, 0, 1);
    filter.end = new Date(year, 11, 31);
  } else if (timeframe === 'week' && week) {
    // Weekly filter (approximate method - more precise implementation would need calendar logic)
    const weekInt = parseInt(week);
    // Calculate the first day of the month
    const firstDay = new Date(year, month - 1, 1);
    // Calculate the start of the week (assuming weeks start from the beginning of the month)
    const weekStart = new Date(firstDay);
    weekStart.setDate(firstDay.getDate() + (weekInt - 1) * 7);
    // Calculate the end of the week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    filter.start = weekStart;
    filter.end = weekEnd;
  }
  
  return filter;
};

// Helper function to get production overview
const getProductionOverview = async (dateFilter) => {
  const query = {};
  
  if (dateFilter.start && dateFilter.end) {
    query.productionDateFrom = { 
      $gte: dateFilter.start, 
      $lte: dateFilter.end 
    };
  }
  
  const productions = await SchoolUniformProduction.find(query);
  
  // Calculate total production quantity
  const totalQuantity = productions.reduce((sum, prod) => sum + prod.quantity, 0);
  
  // Calculate product type breakdown
  const productTypeMap = new Map();
  productions.forEach(production => {
    const current = productTypeMap.get(production.productType) || {
      name: production.productType,
      quantity: 0
    };
    current.quantity += production.quantity;
    productTypeMap.set(production.productType, current);
  });
  
  // Calculate level breakdown
  const levelMap = new Map();
  productions.forEach(production => {
    const current = levelMap.get(production.level) || {
      name: production.level,
      quantity: 0
    };
    current.quantity += production.quantity;
    levelMap.set(production.level, current);
  });
  
  return {
    totalQuantity,
    productTypeBreakdown: Array.from(productTypeMap.values()),
    levelBreakdown: Array.from(levelMap.values()),
    recentProductions: productions.slice(0, 5) // Get 5 most recent productions
  };
};

// Helper function to get sales overview
const getSalesOverview = async (dateFilter) => {
  const query = {};
  
  if (dateFilter.start && dateFilter.end) {
    query.dateClaimed = { 
      $gte: dateFilter.start, 
      $lte: dateFilter.end 
    };
  }
  
  const sales = await SalesReport.find(query).sort({ dateClaimed: -1 });
  
  // Get actual order count from StudentOrder model
  const orderQuery = {};
  if (dateFilter.start && dateFilter.end) {
    orderQuery.updatedAt = { 
      $gte: dateFilter.start, 
      $lte: dateFilter.end 
    };
    orderQuery.status = "Claimed";
  }
  
  const totalOrders = await StudentOrder.countDocuments(orderQuery);
  
  // Calculate total sales
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  // Calculate department breakdown
  const departmentMap = new Map();
  sales.forEach(sale => {
    const current = departmentMap.get(sale.department) || {
      name: sale.department,
      totalSales: 0,
      orderCount: 0
    };
    current.totalSales += sale.totalAmount;
    current.orderCount += 1;
    departmentMap.set(sale.department, current);
  });
  
  // Calculate product type breakdown
  const productTypeMap = new Map();
  sales.forEach(sale => {
    sale.orderItems.forEach(item => {
      const current = productTypeMap.get(item.productType) || {
        name: item.productType,
        totalSales: 0,
        quantity: 0
      };
      current.totalSales += (item.unitPrice * item.quantity);
      current.quantity += item.quantity;
      productTypeMap.set(item.productType, current);
    });
  });
  
  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    departmentBreakdown: Array.from(departmentMap.values()),
    productTypeBreakdown: Array.from(productTypeMap.values()),
    recentSales: sales.slice(0, 5) // Get 5 most recent sales
  };
};

// Helper function to get inventory levels
const getInventoryLevels = async () => {
  // Get uniform inventory
  const uniformInventory = await UniformInventory.find();
  
  // Get raw material inventory
  const rawMaterialInventory = await RawMaterialInventory.find()
    .populate("rawMaterialType", "name description");
  
  // Calculate inventory status counts
  const uniformStatus = {
    available: uniformInventory.filter(item => item.status === "Available").length,
    lowStock: uniformInventory.filter(item => item.status === "Low Stock").length,
    outOfStock: uniformInventory.filter(item => item.status === "Out of Stock").length,
    total: uniformInventory.length
  };
  
  const rawMaterialStatus = {
    available: rawMaterialInventory.filter(item => item.status === "Available").length,
    lowStock: rawMaterialInventory.filter(item => item.status === "Low Stock").length,
    outOfStock: rawMaterialInventory.filter(item => item.status === "Out of Stock").length,
    total: rawMaterialInventory.length
  };
  
  // Group uniforms by level and product type
  const uniformsByLevel = {};
  const uniformsByType = {};
  
  uniformInventory.forEach(item => {
    // Group by level
    if (!uniformsByLevel[item.level]) {
      uniformsByLevel[item.level] = {
        totalItems: 0,
        totalQuantity: 0
      };
    }
    uniformsByLevel[item.level].totalItems += 1;
    uniformsByLevel[item.level].totalQuantity += item.quantity;
    
    // Group by product type
    if (!uniformsByType[item.productType]) {
      uniformsByType[item.productType] = {
        totalItems: 0,
        totalQuantity: 0
      };
    }
    uniformsByType[item.productType].totalItems += 1;
    uniformsByType[item.productType].totalQuantity += item.quantity;
  });
  
  // Group raw materials by category
  const rawMaterialsByCategory = {};
  
  rawMaterialInventory.forEach(item => {
    if (!rawMaterialsByCategory[item.category]) {
      rawMaterialsByCategory[item.category] = {
        totalItems: 0,
        totalQuantity: 0
      };
    }
    rawMaterialsByCategory[item.category].totalItems += 1;
    rawMaterialsByCategory[item.category].totalQuantity += item.quantity;
  });
  
  return {
    uniform: {
      status: uniformStatus,
      byLevel: Object.entries(uniformsByLevel).map(([level, data]) => ({
        name: level,
        ...data
      })),
      byType: Object.entries(uniformsByType).map(([type, data]) => ({
        name: type,
        ...data
      }))
    },
    rawMaterial: {
      status: rawMaterialStatus,
      byCategory: Object.entries(rawMaterialsByCategory).map(([category, data]) => ({
        name: category,
        ...data
      }))
    }
  };
};

// Helper function to get total revenue
const getTotalRevenue = async (dateFilter) => {
  const query = {};
  
  if (dateFilter.start && dateFilter.end) {
    query.dateClaimed = { 
      $gte: dateFilter.start, 
      $lte: dateFilter.end 
    };
  }
  
  const sales = await SalesReport.find(query);
  
  // Calculate total revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  
  // Get monthly revenue breakdown for current year
  const year = dateFilter.start ? dateFilter.start.getFullYear() : new Date().getFullYear();
  
  const monthlyRevenue = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      
      const monthSales = await SalesReport.find({
        dateClaimed: { $gte: monthStart, $lte: monthEnd }
      });
      
      return {
        month: i + 1,
        revenue: monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      };
    })
  );
  
  return {
    totalRevenue,
    monthlyRevenue
  };
}; 