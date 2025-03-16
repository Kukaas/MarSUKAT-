import Product from "../models/product.model.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/JobOrder
export const createProduct = async (req, res) => {
  try {
    const { level, productType, images } = req.body;

    const newProduct = new Product({
      level,
      productType,
      images: images || [],
      isActive: true,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/JobOrder
export const updateProduct = async (req, res) => {
  try {
    const productToUpdate = await Product.findById(req.params.id);
    if (!productToUpdate) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { level, productType, images } = req.body;

    productToUpdate.level = level || productToUpdate.level;
    productToUpdate.productType = productType || productToUpdate.productType;
    if (images) {
      productToUpdate.images = images;
    }

    const updatedProduct = await productToUpdate.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/JobOrder
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate product
// @route   PATCH /api/products/:id/activate
// @access  Private/SuperAdmin
export const activateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.isActive) {
      return res.status(400).json({ message: "Product is already active" });
    }

    product.isActive = true;
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Deactivate product
// @route   PATCH /api/products/:id/deactivate
// @access  Private/SuperAdmin
export const deactivateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: "Product is already inactive" });
    }

    product.isActive = false;
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all active products
// @route   GET /api/products/active
// @access  Public
export const getAllActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
