import mongoose from "mongoose";

const rawMaterialTypeSchema = new mongoose.Schema(
  {
    typeId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
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

// Pre-save middleware to generate typeId
rawMaterialTypeSchema.pre("save", async function (next) {
  if (!this.typeId) {
    const year = new Date().getFullYear();
    const count =
      (await mongoose.model("RawMaterialType").countDocuments()) + 1;
    this.typeId = `RMT-${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const RawMaterialType = mongoose.model(
  "RawMaterialType",
  rawMaterialTypeSchema
);

export default RawMaterialType;
