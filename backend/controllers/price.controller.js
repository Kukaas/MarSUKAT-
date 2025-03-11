import Price from "../models/price.model.js";

// @desc    Get all prices
// @route   GET /api/prices
// @access  Private
export const getAllPrices = async (req, res) => {
  try {
    const prices = await Price.find();
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get price by ID
// @route   GET /api/prices/:id
// @access  Private
export const getPriceById = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id);
    if (!price) {
      return res.status(404).json({ message: "Price not found" });
    }
    res.status(200).json(price);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new price
// @route   POST /api/prices
// @access  Private/SuperAdmin
export const createPrice = async (req, res) => {
  try {
    // Super admin check is handled by middleware

    // Validate price format
    const priceValue = Number(req.body.price);
    if (isNaN(priceValue)) {
      return res.status(400).json({
        message: "Invalid price format. Price must be a valid number.",
      });
    }

    // Check if price has exactly 2 decimal places
    if (!/^\d+\.\d{2}$/.test(priceValue.toFixed(2))) {
      return res.status(400).json({
        message:
          "Price must have exactly 2 decimal places (e.g., 10.00, 15.50).",
      });
    }

    // Check if a price with the same value already exists
    const duplicateCheck = await Price.findOne({ price: priceValue });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "A price with this value already exists",
      });
    }

    const newPrice = new Price({
      price: priceValue,
    });

    const savedPrice = await newPrice.save();
    res.status(201).json(savedPrice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update price
// @route   PUT /api/prices/:id
// @access  Private/SuperAdmin
export const updatePrice = async (req, res) => {
  try {
    // Validate price format
    const priceValue = Number(req.body.price);
    if (isNaN(priceValue)) {
      return res.status(400).json({
        message: "Invalid price format. Price must be a valid number.",
      });
    }

    // Check if price has exactly 2 decimal places
    if (!/^\d+\.\d{2}$/.test(priceValue.toFixed(2))) {
      return res.status(400).json({
        message:
          "Price must have exactly 2 decimal places (e.g., 10.00, 15.50).",
      });
    }

    // First check if the price exists
    const priceToUpdate = await Price.findById(req.params.id);
    if (!priceToUpdate) {
      return res.status(404).json({ message: "Price not found" });
    }

    // Check if the updated price value already exists
    const duplicateCheck = await Price.findOne({
      price: priceValue,
      _id: { $ne: req.params.id },
    });

    if (duplicateCheck) {
      return res.status(400).json({
        message: "A price with this value already exists",
      });
    }

    // Update price
    priceToUpdate.price = priceValue;
    const updatedPrice = await priceToUpdate.save();
    res.status(200).json(updatedPrice);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid price ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete price
// @route   DELETE /api/prices/:id
// @access  Private/SuperAdmin
export const deletePrice = async (req, res) => {
  try {
    const price = await Price.findById(req.params.id);
    if (!price) {
      return res.status(404).json({ message: "Price not found" });
    }

    await price.deleteOne();
    res.status(200).json({ message: "Price deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid price ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
