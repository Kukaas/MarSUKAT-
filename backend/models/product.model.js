import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    default: "default-product",
  },
  contentType: {
    type: String,
    default: "image/png",
  },
  data: {
    type: String,
    default: "", // Will store base64 data URL
  },
});

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
    },
    level: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
    images: [imageSchema],
    isActive: {
      type: Boolean,
      default: true, // Always defaults to true
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate productId
productSchema.pre("save", async function (next) {
  if (!this.productId) {
    const year = new Date().getFullYear();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.productId = `PRD-${year}-${randomString}`;
  }
  // Ensure isActive is always true for new documents
  if (this.isNew) {
    this.isActive = true;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
