import AcademicGownInventory from "../models/academicGownInventory.model.js";
import AcademicGownProduction from "../models/academicGownProduction.model.js";

import RawMaterialInventory from "../models/rawMaterialInventory.model.js";
import RawMaterialType from "../models/rawMaterialType.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./user.controller.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// @desc    Get all academic gown productions
// @route   GET /api/academic-gown-productions
// @access  Private
export const getAllAcademicGownProductions = async (req, res) => {
  try {
    const productions = await AcademicGownProduction.find();
    res.status(200).json(productions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get academic gown production by ID
// @route   GET /api/academic-gown-productions/:id
// @access  Private
export const getAcademicGownProductionById = async (req, res) => {
  try {
    const production = await AcademicGownProduction.findById(req.params.id);
    if (!production) {
      return res
        .status(404)
        .json({ message: "Academic gown production not found" });
    }
    res.status(200).json(production);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new academic gown production
// @route   POST /api/academic-gown-productions
// @access  Private/JobOrder
export const createAcademicGownProduction = async (req, res) => {
  try {
    const { level, productType, size, quantity, rawMaterialsUsed } = req.body;

    // Track missing and insufficient materials
    const inventoryIssues = {
      missingMaterials: [],
      insufficientMaterials: [],
    };

    // Check raw materials availability first
    for (const material of rawMaterialsUsed) {
      const materialType = await RawMaterialType.findOne({
        name: material.type,
      });

      if (!materialType) {
        inventoryIssues.missingMaterials.push({
          type: material.type,
          category: material.category,
          error: "Material type not found",
        });
        continue;
      }

      const rawMaterialInventory = await RawMaterialInventory.findOne({
        category: material.category,
        rawMaterialType: materialType._id,
      });

      if (!rawMaterialInventory) {
        inventoryIssues.missingMaterials.push({
          type: material.type,
          category: material.category,
          error: "No inventory record found",
        });
        continue;
      }

      // Calculate total material needed
      const totalNeeded = parseFloat(material.quantity) * parseInt(quantity);

      if (rawMaterialInventory.quantity < totalNeeded) {
        inventoryIssues.insufficientMaterials.push({
          type: material.type,
          category: material.category,
          available: rawMaterialInventory.quantity,
          needed: totalNeeded,
          unit: material.unit,
          shortageAmount: totalNeeded - rawMaterialInventory.quantity,
        });
      }
    }

    // If there are any inventory issues, return detailed error
    if (
      inventoryIssues.missingMaterials.length > 0 ||
      inventoryIssues.insufficientMaterials.length > 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Raw material inventory issues detected",
        inventoryIssues,
        details: {
          missingMaterials:
            inventoryIssues.missingMaterials.length > 0
              ? "Some required materials are not found in inventory"
              : null,
          insufficientMaterials:
            inventoryIssues.insufficientMaterials.length > 0
              ? "Some materials have insufficient quantity"
              : null,
        },
      });
    }

    // Create the production record
    const newProduction = new AcademicGownProduction({
      level,
      productType,
      size,
      quantity: parseInt(quantity),
      productionDateFrom: new Date(req.body.productionDateFrom),
      productionDateTo: new Date(req.body.productionDateTo),
      rawMaterialsUsed: rawMaterialsUsed.map((material) => ({
        ...material,
        quantity: parseFloat(material.quantity),
      })),
    });

    // Save the production record
    const savedProduction = await newProduction.save();

    // Update gown inventory
    let gownInventory = await AcademicGownInventory.findOne({
      level,
      productType,
      size,
    });

    if (gownInventory) {
      gownInventory.quantity += parseInt(quantity);
      gownInventory.status =
        gownInventory.quantity <= 20 ? "Low Stock" : "Available";
      await gownInventory.save();
    } else {
      gownInventory = new AcademicGownInventory({
        level,
        productType,
        size,
        quantity: parseInt(quantity),
        price: 0,
        status: parseInt(quantity) <= 20 ? "Low Stock" : "Available",
      });
      await gownInventory.save();
    }

    // Update raw materials inventory and check for low stock
    const updatedMaterials = [];
    const lowStockMaterials = [];
    
    for (const material of rawMaterialsUsed) {
      const materialType = await RawMaterialType.findOne({
        name: material.type,
      });
      const rawMaterialInventory = await RawMaterialInventory.findOne({
        category: material.category,
        rawMaterialType: materialType._id,
      });

      // Calculate total material used
      const totalUsed = parseFloat(material.quantity) * parseInt(quantity);
      rawMaterialInventory.quantity -= totalUsed;

      // Update status based on remaining quantity
      if (rawMaterialInventory.quantity <= 0) {
        rawMaterialInventory.status = "Out of Stock";
      } else if (rawMaterialInventory.quantity <= 20) {
        rawMaterialInventory.status = "Low Stock";
      } else {
        rawMaterialInventory.status = "Available";
      }

      await rawMaterialInventory.save();
      updatedMaterials.push(rawMaterialInventory);

      // Check if material needs restock notification
      const unit = material.unit.toLowerCase();
      const threshold = unit === 'roll' ? 10 : 50; // 10 for Roll, 50 for Piece and Yard
      
      if (rawMaterialInventory.quantity <= threshold) {
        lowStockMaterials.push({
          type: material.type,
          category: material.category,
          quantity: rawMaterialInventory.quantity,
          unit: material.unit,
          threshold
        });
      }
    }

    // Send notifications to BAO users for low stock materials
    if (lowStockMaterials.length > 0) {
      const baoUsers = await User.find({ role: 'BAO', isActive: true });
      
      for (const material of lowStockMaterials) {
        const notificationMessage = `Low stock alert: ${material.type} (${material.category}) is running low. Current quantity: ${material.quantity} ${material.unit}. Please restock soon.`;
        
        // Send notification to each BAO user
        for (const baoUser of baoUsers) {
          await createNotification(
            baoUser._id,
            "Raw Material Low Stock Alert",
            notificationMessage
          );
        }
      }
    }

    res.status(201).json({
      production: savedProduction,
      gownInventory,
      updatedMaterials,
      message: "Production created and inventories updated successfully",
    });
  } catch (error) {
    console.error("Production creation error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create production",
      error: error.message,
    });
  }
};

// @desc    Update academic gown production
// @route   PUT /api/academic-gown-productions/:id
// @access  Private/JobOrder
export const updateAcademicGownProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "Production ID is required" });
    }

    const originalProduction = await AcademicGownProduction.findById(id);
    if (!originalProduction) {
      return res.status(404).json({ message: "Production not found" });
    }

    // If quantity is being updated, adjust raw materials and gown inventory
    if (originalProduction.quantity !== parseInt(updates.quantity)) {
      const quantityDifference =
        parseInt(updates.quantity) - originalProduction.quantity;

      // Update raw materials inventory
      for (const material of originalProduction.rawMaterialsUsed) {
        const materialType = await RawMaterialType.findOne({
          name: material.type,
        });
        const rawMaterialInventory = await RawMaterialInventory.findOne({
          category: material.category,
          rawMaterialType: materialType._id,
        });

        if (rawMaterialInventory) {
          // Calculate material quantity difference
          const materialDifference =
            parseFloat(material.quantity) * quantityDifference;
          rawMaterialInventory.quantity -= materialDifference;

          // Update status
          if (rawMaterialInventory.quantity <= 0) {
            rawMaterialInventory.status = "Out of Stock";
          } else if (rawMaterialInventory.quantity <= 20) {
            rawMaterialInventory.status = "Low Stock";
          } else {
            rawMaterialInventory.status = "Available";
          }

          await rawMaterialInventory.save();
        }
      }

      // Update gown inventory
      let gownInventory = await AcademicGownInventory.findOne({
        level: originalProduction.level,
        productType: originalProduction.productType,
        size: originalProduction.size,
      });

      if (gownInventory) {
        gownInventory.quantity += quantityDifference;
        gownInventory.status =
          gownInventory.quantity <= 20 ? "Low Stock" : "Available";
        if (gownInventory.quantity <= 0) {
          gownInventory.status = "Out of Stock";
        }
        await gownInventory.save();
      }
    }

    // Update the production record
    Object.assign(originalProduction, updates);
    const updatedProduction = await originalProduction.save();

    res.status(200).json({
      production: updatedProduction,
      message: "Production and inventories updated successfully",
    });
  } catch (error) {
    console.error("Error updating production:", error);
    res.status(500).json({
      message: "Failed to update production",
      error: error.message,
    });
  }
};

// @desc    Delete academic gown production
// @route   DELETE /api/academic-gown-productions/:id
// @access  Private/JobOrder
export const deleteAcademicGownProduction = async (req, res) => {
  try {
    const production = await AcademicGownProduction.findById(req.params.id);
    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    // Return raw materials to inventory
    for (const material of production.rawMaterialsUsed) {
      const materialType = await RawMaterialType.findOne({
        name: material.type,
      });
      const rawMaterialInventory = await RawMaterialInventory.findOne({
        category: material.category,
        rawMaterialType: materialType._id,
      });

      if (rawMaterialInventory) {
        // Return materials to inventory
        const returnedQuantity =
          parseFloat(material.quantity) * production.quantity;
        rawMaterialInventory.quantity += returnedQuantity;

        // Update status
        if (rawMaterialInventory.quantity > 20) {
          rawMaterialInventory.status = "Available";
        } else if (rawMaterialInventory.quantity > 0) {
          rawMaterialInventory.status = "Low Stock";
        }

        await rawMaterialInventory.save();
      }
    }

    // Update gown inventory
    const gownInventory = await AcademicGownInventory.findOne({
      level: production.level,
      productType: production.productType,
      size: production.size,
    });

    if (gownInventory) {
      gownInventory.quantity -= production.quantity;
      if (gownInventory.quantity <= 0) {
        gownInventory.status = "Out of Stock";
      } else if (gownInventory.quantity <= 20) {
        gownInventory.status = "Low Stock";
      } else {
        gownInventory.status = "Available";
      }
      await gownInventory.save();
    }

    await production.deleteOne();
    res.status(200).json({
      message: "Production deleted and inventories updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get production statistics
// @route   GET /api/academic-gown-productions/stats
// @access  Private
export const getProductionStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {};

    // Validate year and month
    if (year && isNaN(parseInt(year))) {
      return res.status(400).json({ message: "Invalid year format" });
    }

    if (month && (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)) {
      return res.status(400).json({ message: "Invalid month format. Month must be between 1 and 12" });
    }

    // Build date query
    if (year) {
      query.productionDateFrom = {
        $gte: new Date(parseInt(year), 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1),
      };
    }

    if (month) {
      query.productionDateFrom = {
        $gte: new Date(parseInt(year), parseInt(month) - 1, 1),
        $lt: new Date(parseInt(year), parseInt(month), 1),
      };
    }

    const productions = await AcademicGownProduction.find(query);

    // Initialize monthly data structure
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: MONTHS[i],
      data: {}
    }));

    // Process each production record
    productions.forEach((production) => {
      const month = new Date(production.productionDateFrom).getMonth();
      const productType = production.productType;

      // Initialize product type data if not exists
      if (!monthlyData[month].data[productType]) {
        monthlyData[month].data[productType] = 0;
      }

      // Add quantity to the product type
      monthlyData[month].data[productType] += production.quantity;
    });

    // Calculate product type and size breakdown
    const productTypeSizeMap = new Map();
    productions.forEach((production) => {
      const key = `${production.productType}-${production.size}`;
      const current = productTypeSizeMap.get(key) || {
        name: `${production.productType} (${production.size})`,
        quantity: 0,
        productType: production.productType,
        size: production.size
      };
      current.quantity += production.quantity;
      productTypeSizeMap.set(key, current);
    });
    const productTypeSizeBreakdown = Array.from(productTypeSizeMap.values());

    // Calculate level breakdown
    const levelMap = new Map();
    productions.forEach((production) => {
      const current = levelMap.get(production.level) || {
        name: production.level,
        quantity: 0
      };
      current.quantity += production.quantity;
      levelMap.set(production.level, current);
    });
    const levelBreakdown = Array.from(levelMap.values());

    // Calculate total production
    const totalProduction = productions.reduce(
      (sum, production) => sum + production.quantity,
      0
    );

    res.status(200).json({
      monthlyData,
      productTypeSizeBreakdown,
      levelBreakdown,
      totalProduction,
    });
  } catch (error) {
    console.error("Error in getProductionStats:", error);
    res.status(500).json({ 
      message: "Failed to fetch production statistics",
      error: error.message 
    });
  }
};

// @desc    Get raw materials usage statistics
// @route   GET /api/academic-gown-productions/raw-materials-usage
// @access  Private
export const getRawMaterialsUsageStats = async (req, res) => {
  try {
    const { year, month, category, type, material } = req.query;
    const query = {};

    // Build date filter
    if (year) {
      query.productionDateFrom = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1),
      };
    }

    if (month) {
      query.productionDateFrom = {
        $gte: new Date(year, parseInt(month) - 1, 1),
        $lt: new Date(year, parseInt(month), 1),
      };
    }

    // Filter by material category, type, or specific material if specified
    if (category || type || material) {
      query["rawMaterialsUsed"] = {};
      
      if (category) {
        query["rawMaterialsUsed.category"] = category;
      }
      
      if (type) {
        query["rawMaterialsUsed.type"] = type;
      }
      
      // Handle specific material filter (format: category-type)
      if (material) {
        const [materialCategory, materialType] = material.split('-');
        if (materialCategory && materialType) {
          query["rawMaterialsUsed.category"] = materialCategory;
          query["rawMaterialsUsed.type"] = materialType;
        }
      }
    }

    const productions = await AcademicGownProduction.find(query);

    // Track monthly usage by material
    const monthlyUsageByMaterial = {};
    const yearlyUsageByMaterial = {};
    const materialList = new Set();

    productions.forEach(production => {
      const productionMonth = new Date(production.productionDateFrom).getMonth() + 1;
      const productionYear = new Date(production.productionDateFrom).getFullYear();
      
      production.rawMaterialsUsed.forEach(material => {
        // Skip if not matching the specified material filter
        if (req.query.material) {
          const materialId = `${material.category}-${material.type}`;
          if (materialId !== req.query.material) {
            return;
          }
        }
        
        const materialKey = `${material.category}-${material.type}`;
        materialList.add(materialKey);
        
        // Calculate total quantity used for this production
        const totalUsed = parseFloat(material.quantity) * production.quantity;
        
        // Monthly tracking
        const monthKey = `${productionYear}-${productionMonth}`;
        if (!monthlyUsageByMaterial[monthKey]) {
          monthlyUsageByMaterial[monthKey] = {};
        }
        
        if (!monthlyUsageByMaterial[monthKey][materialKey]) {
          monthlyUsageByMaterial[monthKey][materialKey] = {
            category: material.category,
            type: material.type,
            quantity: 0,
            unit: material.unit,
            name: material.name || `${material.category} ${material.type}`
          };
        }
        
        monthlyUsageByMaterial[monthKey][materialKey].quantity += totalUsed;
        
        // Yearly tracking
        if (!yearlyUsageByMaterial[productionYear]) {
          yearlyUsageByMaterial[productionYear] = {};
        }
        
        if (!yearlyUsageByMaterial[productionYear][materialKey]) {
          yearlyUsageByMaterial[productionYear][materialKey] = {
            category: material.category,
            type: material.type,
            quantity: 0,
            unit: material.unit,
            name: material.name || `${material.category} ${material.type}`
          };
        }
        
        yearlyUsageByMaterial[productionYear][materialKey].quantity += totalUsed;
      });
    });

    // Convert to arrays for easier consumption by frontend
    const monthlyData = Object.keys(monthlyUsageByMaterial).map(monthKey => {
      const [year, month] = monthKey.split('-');
      return {
        year: parseInt(year),
        month: parseInt(month),
        materials: Object.values(monthlyUsageByMaterial[monthKey])
      };
    });

    const yearlyData = Object.keys(yearlyUsageByMaterial).map(year => {
      return {
        year: parseInt(year),
        materials: Object.values(yearlyUsageByMaterial[year])
      };
    });

    // Get current inventory levels for comparison
    const materialInventory = [];
    for (const materialKey of materialList) {
      const [category, type] = materialKey.split('-');
      const materialType = await RawMaterialType.findOne({ name: type });
      
      if (materialType) {
        const inventory = await RawMaterialInventory.findOne({
          category,
          rawMaterialType: materialType._id
        }).populate('rawMaterialType', 'name');
        
        if (inventory) {
          materialInventory.push({
            category,
            type,
            name: inventory.name || `${category} ${type}`,
            currentQuantity: inventory.quantity,
            unit: inventory.unit,
            status: inventory.status
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      monthlyData,
      yearlyData,
      currentInventory: materialInventory
    });
  } catch (error) {
    console.error("Error fetching raw materials usage stats:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch raw materials usage statistics",
      error: error.message 
    });
  }
};

// @desc    Generate detailed raw material usage report
// @route   GET /api/academic-gown-productions/material-usage-report
// @access  Private
export const getMaterialUsageReport = async (req, res) => {
  try {
    let { startDate, endDate, category, type } = req.query;
    
    // Set default date range if not provided (last 30 days)
    if (!startDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      startDate = thirtyDaysAgo;
    } else {
      startDate = new Date(startDate);
    }
    
    if (!endDate) {
      endDate = new Date();
    } else {
      endDate = new Date(endDate);
    }
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format."
      });
    }
    
    // Generate the report using the static method
    const report = await AcademicGownProduction.generateMaterialUsageReport(
      startDate,
      endDate,
      category,
      type
    );
    
    // Get current inventory levels for comparison
    const materialInventory = [];
    for (const material of report) {
      const materialType = await RawMaterialType.findOne({ name: material.type });
      
      if (materialType) {
        const inventory = await RawMaterialInventory.findOne({
          category: material.category,
          rawMaterialType: materialType._id
        });
        
        if (inventory) {
          materialInventory.push({
            category: material.category,
            type: material.type,
            currentQuantity: inventory.quantity,
            unit: inventory.unit,
            status: inventory.status
          });
        }
      }
    }
    
    // Calculate consumption rate (average per day)
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const reportWithRates = report.map(material => {
      const matchingInventory = materialInventory.find(
        inv => inv.category === material.category && inv.type === material.type
      );
      
      return {
        ...material,
        currentInventory: matchingInventory ? matchingInventory.currentQuantity : 0,
        inventoryStatus: matchingInventory ? matchingInventory.status : 'Unknown',
        dailyConsumptionRate: parseFloat((material.totalQuantity / daysDiff).toFixed(2)),
        estimatedDaysRemaining: matchingInventory 
          ? Math.floor(matchingInventory.currentQuantity / (material.totalQuantity / daysDiff))
          : 0
      };
    });
    
    res.status(200).json({
      success: true,
      dateRange: {
        startDate,
        endDate,
        daysCovered: daysDiff
      },
      materialUsage: reportWithRates
    });
  } catch (error) {
    console.error("Error generating material usage report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate material usage report",
      error: error.message
    });
  }
}; 