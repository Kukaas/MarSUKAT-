import mongoose from "mongoose";

const departmentLevelSchema = new mongoose.Schema(
  {
    departmentLevelId: {
      type: String,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    levelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate departmentLevelId
departmentLevelSchema.pre("save", async function (next) {
  if (!this.departmentLevelId) {
    const year = new Date().getFullYear();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.departmentLevelId = `DEPTLVL-${year}-${randomString}`;
  }
  next();
});

// Removed unique compound index to allow duplicate combinations

const DepartmentLevel = mongoose.model(
  "DepartmentLevel",
  departmentLevelSchema
);

export default DepartmentLevel;
