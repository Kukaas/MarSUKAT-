import mongoose from "mongoose";

const accomplishmentReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    accomplishmentType: {
      type: String,
      required: true,
      enum: [
        "Sewing",
        "Pattern Making",
        "Cutting",
        "Quality Control",
        "Material Preparation",
        "Finishing",
        "Alterations",
        "Maintenance"
      ]
    },
    dateStarted: {
      type: Date,
      required: true,
    },
    dateAccomplished: {
      type: Date,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate reportId
accomplishmentReportSchema.pre("save", async function (next) {
  if (!this.reportId) {
    const year = new Date().getFullYear();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.reportId = `ACC-${year}-${randomString}`;
  }
  next();
});

const AccomplishmentReport = mongoose.model(
  "AccomplishmentReport",
  accomplishmentReportSchema
);

export default AccomplishmentReport; 