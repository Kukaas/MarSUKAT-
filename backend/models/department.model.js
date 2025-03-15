import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate departmentId
departmentSchema.pre("save", async function (next) {
  if (!this.departmentId) {
    const year = new Date().getFullYear();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.departmentId = `DEPT-${year}-${randomString}`;
  }
  next();
});

const Department = mongoose.model("Department", departmentSchema);

export default Department;
