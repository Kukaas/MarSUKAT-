import SchoolUniformProduction from "../models/schoolUniformProduction.model.js";
import UniformInventory from "../models/uniformInventory.model.js";
import RawMaterialInventory from "../models/rawMaterialInventory.model.js";
import RawMaterialType from "../models/rawMaterialType.model.js";

// @desc    Get all school uniform productions
// @route   GET /api/school-uniform-productions
// @access  Private
export const getAllSchoolUniformProductions = async (req, res) => {
  try {
    const productions = await SchoolUniformProduction.find();
    res.status(200).json(productions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get school uniform production by ID
// @route   GET /api/school-uniform-productions/:id
// @access  Private
export const getSchoolUniformProductionById = async (req, res) => {
  try {
    const production = await SchoolUniformProduction.findById(req.params.id);
    if (!production) {
      return res
        .status(404)
        .json({ message: "School uniform production not found" });
    }
    res.status(200).json(production);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new school uniform production
// @route   POST /api/school-uniform-productions
// @access  Private/JobOrder
export const createSchoolUniformProduction = async (req, res) => {
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
    const newProduction = new SchoolUniformProduction({
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

    // Update uniform inventory
    let uniformInventory = await UniformInventory.findOne({
      level,
      productType,
      size,
    });

    if (uniformInventory) {
      uniformInventory.quantity += parseInt(quantity);
      uniformInventory.status =
        uniformInventory.quantity <= 20 ? "Low Stock" : "Available";
      await uniformInventory.save();
    } else {
      uniformInventory = new UniformInventory({
        level,
        productType,
        size,
        quantity: parseInt(quantity),
        price: 0,
        status: parseInt(quantity) <= 20 ? "Low Stock" : "Available",
      });
      await uniformInventory.save();
    }

    // Update raw materials inventory
    const updatedMaterials = [];
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
    }

    res.status(201).json({
      production: savedProduction,
      uniformInventory,
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

// @desc    Update school uniform production
// @route   PUT /api/school-uniform-productions/:id
// @access  Private/JobOrder
export const updateSchoolUniformProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "Production ID is required" });
    }

    const originalProduction = await SchoolUniformProduction.findById(id);
    if (!originalProduction) {
      return res.status(404).json({ message: "Production not found" });
    }

    // If quantity is being updated, adjust raw materials and uniform inventory
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

      // Update uniform inventory
      let uniformInventory = await UniformInventory.findOne({
        level: originalProduction.level,
        productType: originalProduction.productType,
        size: originalProduction.size,
      });

      if (uniformInventory) {
        uniformInventory.quantity += quantityDifference;
        uniformInventory.status =
          uniformInventory.quantity <= 20 ? "Low Stock" : "Available";
        if (uniformInventory.quantity <= 0) {
          uniformInventory.status = "Out of Stock";
        }
        await uniformInventory.save();
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

// @desc    Delete school uniform production
// @route   DELETE /api/school-uniform-productions/:id
// @access  Private/JobOrder
export const deleteSchoolUniformProduction = async (req, res) => {
  try {
    const production = await SchoolUniformProduction.findById(req.params.id);
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

    // Update uniform inventory
    const uniformInventory = await UniformInventory.findOne({
      level: production.level,
      productType: production.productType,
      size: production.size,
    });

    if (uniformInventory) {
      uniformInventory.quantity -= production.quantity;
      if (uniformInventory.quantity <= 0) {
        uniformInventory.status = "Out of Stock";
      } else if (uniformInventory.quantity <= 20) {
        uniformInventory.status = "Low Stock";
      } else {
        uniformInventory.status = "Available";
      }
      await uniformInventory.save();
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
// @route   GET /api/school-uniform-productions/stats
// @access  Private
export const getProductionStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {};

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

    const productions = await SchoolUniformProduction.find(query);

    // Calculate monthly data
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      quantity: 0,
    }));

    productions.forEach((production) => {
      const month = new Date(production.productionDateFrom).getMonth();
      monthlyData[month].quantity += production.quantity;
    });

    // Calculate product type breakdown
    const productTypeMap = new Map();
    productions.forEach((production) => {
      const current = productTypeMap.get(production.productType) || {
        name: production.productType,
        quantity: 0,
      };
      current.quantity += production.quantity;
      productTypeMap.set(production.productType, current);
    });
    const productTypeBreakdown = Array.from(productTypeMap.values());

    // Calculate level breakdown
    const levelMap = new Map();
    productions.forEach((production) => {
      const current = levelMap.get(production.level) || {
        name: production.level,
        quantity: 0,
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
      productTypeBreakdown,
      levelBreakdown,
      totalProduction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
