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
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.unitId = `UNT-${year}-${randomString}`;
  }
  next();
});

const Unit = mongoose.model("Unit", unitSchema);

export default Unit;
