import mongoose from "mongoose";

const uniformInventorySchema = new mongoose.Schema(
  {
    inventoryId: {
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
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      get: (v) => parseFloat(v.toFixed(2)),
      set: (v) => parseFloat(v.toFixed(2)),
    },
    price: {
      type: Number,
      required: true,
      get: (v) => parseFloat(v.toFixed(2)),
      set: (v) => parseFloat(v.toFixed(2)),
    },
    status: {
      type: String,
      required: true,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
    image: {
      filename: {
        type: String,
        default: "default-uniform",
      },
      contentType: {
        type: String,
        default: "image/png",
      },
      data: {
        type: String,
        default: "", // Will store base64 data URL
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

// Pre-save middleware to generate inventoryId
uniformInventorySchema.pre("save", async function (next) {
  if (!this.inventoryId) {
    const year = new Date().getFullYear();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.inventoryId = `UNI-${year}-${randomString}`;
  }
  next();
});

const UniformInventory = mongoose.model(
  "UniformInventory",
  uniformInventorySchema
);

export default UniformInventory;
