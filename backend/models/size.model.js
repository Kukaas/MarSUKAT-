import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    sizeId: {
      type: String,
      unique: true,
    },
    size: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate sizeId
sizeSchema.pre("save", async function (next) {
  if (!this.sizeId) {
    const year = new Date().getFullYear();
    const count = (await mongoose.model("Size").countDocuments()) + 1;
    this.sizeId = `SIZ-${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const Size = mongoose.model("Size", sizeSchema);

export default Size;
