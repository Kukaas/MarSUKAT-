import Announcement from "../models/announcement.model.js";

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ startDate: -1 })
      .select("-__v");
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private/SuperAdmin
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, startDate, endDate, priority } = req.body;

    const newAnnouncement = new Announcement({
      title,
      content,
      startDate,
      endDate,
      priority: priority || "low",
    });

    const savedAnnouncement = await newAnnouncement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/SuperAdmin
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const { title, content, startDate, endDate, priority } = req.body;

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.startDate = startDate || announcement.startDate;
    announcement.endDate = endDate || announcement.endDate;
    announcement.priority = priority || announcement.priority;

    const updatedAnnouncement = await announcement.save();
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/SuperAdmin
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await announcement.deleteOne();
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current announcements (where end date is after current date)
// @route   GET /api/announcements/current
// @access  Public
export const getCurrentAnnouncements = async (req, res) => {
  try {
    const currentDate = new Date();

    const announcements = await Announcement.find({
      endDate: { $gte: currentDate },
    })
      .sort({ startDate: -1 })
      .select("-__v");

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
