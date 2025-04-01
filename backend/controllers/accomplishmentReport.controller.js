import AccomplishmentReport from "../models/accomplishmentReport.model.js";

// @desc    Get all accomplishment reports
// @route   GET /api/accomplishment-reports
// @access  Private
export const getAllAccomplishmentReports = async (req, res) => {
  try {
    const reports = await AccomplishmentReport.find()
      .sort({ dateAccomplished: -1 })
      .populate('assignedEmployee', 'name');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get accomplishment report by ID
// @route   GET /api/accomplishment-reports/:id
// @access  Private
export const getAccomplishmentReportById = async (req, res) => {
  try {
    const report = await AccomplishmentReport.findById(req.params.id)
      .populate('assignedEmployee', 'name');
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new accomplishment report
// @route   POST /api/accomplishment-reports
// @access  Private
export const createAccomplishmentReport = async (req, res) => {
  try {
    const { assignedEmployee, accomplishmentType, dateStarted, dateAccomplished } = req.body;

    const newReport = new AccomplishmentReport({
      assignedEmployee,
      accomplishmentType,
      dateStarted,
      dateAccomplished,
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update accomplishment report
// @route   PUT /api/accomplishment-reports/:id
// @access  Private
export const updateAccomplishmentReport = async (req, res) => {
  try {
    const reportToUpdate = await AccomplishmentReport.findById(req.params.id);
    if (!reportToUpdate) {
      return res.status(404).json({ message: "Report not found" });
    }

    const { assignedEmployee, accomplishmentType, dateStarted, dateAccomplished } = req.body;

    if (assignedEmployee) reportToUpdate.assignedEmployee = assignedEmployee;
    if (accomplishmentType) reportToUpdate.accomplishmentType = accomplishmentType;
    if (dateStarted) reportToUpdate.dateStarted = dateStarted;
    if (dateAccomplished) reportToUpdate.dateAccomplished = dateAccomplished;

    const updatedReport = await reportToUpdate.save();
    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete accomplishment report
// @route   DELETE /api/accomplishment-reports/:id
// @access  Private
export const deleteAccomplishmentReport = async (req, res) => {
  try {
    const report = await AccomplishmentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await report.deleteOne();
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 