import Level from "../models/level.model.js";

// Create a new level (Super Admin only)
export const createLevel = async (req, res) => {
  try {
    // Super admin check is handled by middleware
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
    // Super admin check is handled by middleware
    const updatedLevel = await Level.findByIdAndUpdate(
      req.params.id,
      {
        level: req.body.level,
        description: req.body.description,
      },
      { new: true }
    );

    if (!updatedLevel) {
      return res.status(404).json({ message: "Level not found" });
    }

    res.status(200).json(updatedLevel);
  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
};
