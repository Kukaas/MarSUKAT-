import mongoose from "mongoose";

const rawMaterialInventorySchema = new mongoose.Schema(
  {
    inventoryId: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    rawMaterialType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterialType",
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    quantity: {
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
        default: "default-material",
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
rawMaterialInventorySchema.pre("save", async function (next) {
  if (!this.inventoryId) {
    const year = new Date().getFullYear();
    const count =
      (await mongoose.model("RawMaterialInventory").countDocuments()) + 1;
    this.inventoryId = `RMI-${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const RawMaterialInventory = mongoose.model(
  "RawMaterialInventory",
  rawMaterialInventorySchema
);

export default RawMaterialInventory;
