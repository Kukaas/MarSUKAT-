import mongoose from "mongoose";

const departmentLevelSchema = new mongoose.Schema(
  {
    departmentLevelId: {
      type: String,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    level: {
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
    const count =
      (await mongoose.model("DepartmentLevel").countDocuments()) + 1;
    this.departmentLevelId = `DEPTLVL-${year}-${String(count).padStart(
      3,
      "0"
    )}`;
  }
  next();
});

// Removed unique compound index to allow duplicate combinations

const DepartmentLevel = mongoose.model(
  "DepartmentLevel",
  departmentLevelSchema
);

export default DepartmentLevel;
