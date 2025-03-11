import Category from "../models/category.model.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/SuperAdmin
export const createCategory = async (req, res) => {
  try {
    // Super admin check is handled by middleware

    // Check if a category with the same name already exists
    const duplicateCheck = await Category.findOne({
      category: req.body.category,
    });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "A category with this name already exists",
      });
    }

    const newCategory = new Category({
      category: req.body.category,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/SuperAdmin
export const updateCategory = async (req, res) => {
  try {
    // First check if the category exists
    const categoryToUpdate = await Category.findById(req.params.id);
    if (!categoryToUpdate) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if the updated category name already exists
    const duplicateCheck = await Category.findOne({
      category: req.body.category,
      _id: { $ne: req.params.id },
    });

    if (duplicateCheck) {
      return res.status(400).json({
        message: "A category with this name already exists",
      });
    }

    // Update category
    categoryToUpdate.category = req.body.category;
    const updatedCategory = await categoryToUpdate.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/SuperAdmin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
