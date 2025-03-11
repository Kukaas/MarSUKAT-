import ProductType from "../models/productType.model.js";
import Price from "../models/price.model.js";
import Level from "../models/level.model.js";
import Size from "../models/size.model.js";
import Category from "../models/category.model.js";
import Unit from "../models/unit.model.js";
import RawMaterialType from "../models/rawMaterialType.model.js";

// @desc    Get all product types
// @route   GET /api/product-types
// @access  Private
export const getAllProductTypes = async (req, res) => {
  try {
    const productTypes = await ProductType.find();
    res.status(200).json(productTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product type by ID
// @route   GET /api/product-types/:id
// @access  Private
export const getProductTypeById = async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);
    if (!productType) {
      return res.status(404).json({ message: "Product type not found" });
    }
    res.status(200).json(productType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product type
// @route   POST /api/product-types
// @access  Private/SuperAdmin
export const createProductType = async (req, res) => {
  try {
    // Verify if level exists
    const levelExists = await Level.findOne({ level: req.body.level });
    if (!levelExists) {
      return res.status(400).json({ message: "Invalid level specified" });
    }

    // Verify if size exists
    const sizeExists = await Size.findOne({ size: req.body.size });
    if (!sizeExists) {
      return res.status(400).json({ message: "Invalid size specified" });
    }

    // Verify raw materials
    if (req.body.rawMaterialsUsed) {
      for (const material of req.body.rawMaterialsUsed) {
        // Verify category
        const categoryExists = await Category.findOne({
          category: material.category,
        });
        if (!categoryExists) {
          return res
            .status(400)
            .json({ message: `Invalid category: ${material.category}` });
        }

        // Verify type
        const typeExists = await RawMaterialType.findOne({
          name: material.type,
        });
        if (!typeExists) {
          return res
            .status(400)
            .json({ message: `Invalid raw material type: ${material.type}` });
        }

        // Verify unit
        const unitExists = await Unit.findOne({ unit: material.unit });
        if (!unitExists) {
          return res
            .status(400)
            .json({ message: `Invalid unit: ${material.unit}` });
        }

        // Verify quantity is positive
        if (material.quantity <= 0) {
          return res.status(400).json({ message: "Quantity must be positive" });
        }
      }
    }

    const newProductType = new ProductType({
      level: req.body.level,
      productType: req.body.productType,
      size: req.body.size,
      price: parseFloat(req.body.price),
      rawMaterialsUsed: req.body.rawMaterialsUsed.map((material) => ({
        ...material,
        quantity: parseFloat(material.quantity),
      })),
    });

    const savedProductType = await newProductType.save();
    await savedProductType.populate("price");
    res.status(201).json(savedProductType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product type
// @route   PUT /api/product-types/:id
// @access  Private/SuperAdmin
export const updateProductType = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product type ID is required" });
    }

    const productType = await ProductType.findById(id);
    if (!productType) {
      return res.status(404).json({ message: "Product type not found" });
    }

    // Update the product type fields
    Object.assign(productType, updates);
    const updatedProductType = await productType.save();

    res.status(200).json(updatedProductType);
  } catch (error) {
    console.error("Error updating product type:", error);
    res
      .status(500)
      .json({ message: "Failed to update product type", error: error.message });
  }
};

// @desc    Delete product type
// @route   DELETE /api/product-types/:id
// @access  Private/SuperAdmin
export const deleteProductType = async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);
    if (!productType) {
      return res.status(404).json({ message: "Product type not found" });
    }

    await productType.deleteOne();
    res.status(200).json({ message: "Product type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
