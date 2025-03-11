import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      unique: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate unitId
unitSchema.pre("save", async function (next) {
  if (!this.unitId) {
    const year = new Date().getFullYear();
    const count = (await mongoose.model("Unit").countDocuments()) + 1;
    this.unitId = `UNT-${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const Unit = mongoose.model("Unit", unitSchema);

export default Unit;
