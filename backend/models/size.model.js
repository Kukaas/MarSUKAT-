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
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.sizeId = `SIZ-${year}-${randomString}`;
  }
  next();
});

const Size = mongoose.model("Size", sizeSchema);

export default Size;
