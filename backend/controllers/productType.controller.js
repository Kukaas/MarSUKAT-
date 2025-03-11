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
    const productTypes = await ProductType.find().populate("price");
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
    const productType = await ProductType.findById(req.params.id).populate(
      "price"
    );
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
    // Verify if price exists
    const price = await Price.findById(req.body.price);
    if (!price) {
      return res.status(400).json({ message: "Invalid price ID" });
    }

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
      price: req.body.price,
      rawMaterialsUsed: req.body.rawMaterialsUsed,
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
    const productType = await ProductType.findById(req.params.id);
    if (!productType) {
      return res.status(404).json({ message: "Product type not found" });
    }

    if (req.body.price) {
      // Verify if new price exists
      const price = await Price.findById(req.body.price);
      if (!price) {
        return res.status(400).json({ message: "Invalid price ID" });
      }
    }

    if (req.body.level) {
      // Verify if level exists
      const levelExists = await Level.findOne({ level: req.body.level });
      if (!levelExists) {
        return res.status(400).json({ message: "Invalid level specified" });
      }
    }

    if (req.body.size) {
      // Verify if size exists
      const sizeExists = await Size.findOne({ size: req.body.size });
      if (!sizeExists) {
        return res.status(400).json({ message: "Invalid size specified" });
      }
    }

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

    // Update fields
    Object.keys(req.body).forEach((key) => {
      productType[key] = req.body[key];
    });

    const updatedProductType = await productType.save();
    await updatedProductType.populate("price");
    res.status(200).json(updatedProductType);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: error.message });
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
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
