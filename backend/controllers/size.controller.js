import Size from "../models/size.model.js";

// @desc    Get all sizes
// @route   GET /api/sizes
// @access  Private
export const getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.find();
    res.status(200).json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get size by ID
// @route   GET /api/sizes/:id
// @access  Private
export const getSizeById = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: "Size not found" });
    }
    res.status(200).json(size);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new size
// @route   POST /api/sizes
// @access  Private/SuperAdmin
export const createSize = async (req, res) => {
  try {
    // Super admin check is handled by middleware

    // Check if a size with the same name already exists
    const duplicateCheck = await Size.findOne({ size: req.body.size });
    if (duplicateCheck) {
      return res.status(400).json({
        message: "A size with this name already exists",
      });
    }

    const newSize = new Size({
      size: req.body.size,
    });

    const savedSize = await newSize.save();
    res.status(201).json(savedSize);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update size
// @route   PUT /api/sizes/:id
// @access  Private/SuperAdmin
export const updateSize = async (req, res) => {
  try {
    // First check if the size exists
    const sizeToUpdate = await Size.findById(req.params.id);
    if (!sizeToUpdate) {
      return res.status(404).json({ message: "Size not found" });
    }

    // Check if the updated size name already exists
    const duplicateCheck = await Size.findOne({
      size: req.body.size,
      _id: { $ne: req.params.id },
    });

    if (duplicateCheck) {
      return res.status(400).json({
        message: "A size with this name already exists",
      });
    }

    // Update size
    sizeToUpdate.size = req.body.size;
    const updatedSize = await sizeToUpdate.save();
    res.status(200).json(updatedSize);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid size ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete size
// @route   DELETE /api/sizes/:id
// @access  Private/SuperAdmin
export const deleteSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: "Size not found" });
    }

    await size.deleteOne();
    res.status(200).json({ message: "Size deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid size ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
