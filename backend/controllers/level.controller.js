import Level from "../models/level.model.js";

// Create a new level (Super Admin only)
export const createLevel = async (req, res) => {
  try {
    // Super admin check is handled by middleware

    // Check if a level with the same name already exists
    const existingLevel = await Level.findOne({ level: req.body.level });
    if (existingLevel) {
      return res.status(400).json({
        message: "A level with this name already exists",
      });
    }

    const newLevel = new Level({
      level: req.body.level,
      description: req.body.description,
    });

    const savedLevel = await newLevel.save();
    res.status(201).json(savedLevel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all levels
export const getAllLevels = async (req, res) => {
  try {
    const levels = await Level.find();
    res.status(200).json(levels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get level by ID
export const getLevelById = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }
    res.status(200).json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update level (Super Admin only)
export const updateLevel = async (req, res) => {
  try {
    // First check if the level exists
    const existingLevel = await Level.findById(req.params.id);
    if (!existingLevel) {
      return res.status(404).json({ message: "Level not found" });
    }

    // Keep the existing levelId and update other fields
    const updatedLevel = await Level.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          level: req.body.level,
          description: req.body.description,
          // levelId remains unchanged
        },
      },
      { new: true }
    );

    res.status(200).json(updatedLevel);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid level ID format" });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete level (Super Admin only)
export const deleteLevel = async (req, res) => {
  try {
    // Super admin check is handled by middleware
    const deletedLevel = await Level.findByIdAndDelete(req.params.id);

    if (!deletedLevel) {
      return res.status(404).json({ message: "Level not found" });
    }

    res.status(200).json({ message: "Level deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid level ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};
