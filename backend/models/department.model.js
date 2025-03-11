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
    const count = (await mongoose.model("Department").countDocuments()) + 1;
    this.departmentId = `DEPT-${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const Department = mongoose.model("Department", departmentSchema);

export default Department;
