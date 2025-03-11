import mongoose from "mongoose";

const productTypeSchema = new mongoose.Schema(
  {
    productTypeId: {
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
    price: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d+\.\d{2}$/.test(parseFloat(v).toFixed(2));
        },
        message: (props) =>
          `${props.value} is not a valid price. Price must have exactly 2 decimal places.`,
      },
      set: (v) => parseFloat(v),
    },
    rawMaterialsUsed: [
      {
        category: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0.01, "Quantity must be greater than 0"],
          validate: {
            validator: function (v) {
              return /^\d+\.\d{2}$/.test(parseFloat(v).toFixed(2));
            },
            message: (props) =>
              `${props.value} is not a valid quantity. Quantity must have exactly 2 decimal places.`,
          },
          set: (v) => parseFloat(v),
        },
        unit: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware to generate productTypeId and validate references
productTypeSchema.pre("save", async function (next) {
  try {
    // Generate productTypeId if not exists
    if (!this.productTypeId) {
      const year = new Date().getFullYear();
      const count = (await mongoose.model("ProductType").countDocuments()) + 1;
      this.productTypeId = `PT-${year}-${String(count).padStart(3, "0")}`;
    }

    // Validate level exists
    const Level = mongoose.model("Level");
    const levelExists = await Level.findOne({ level: this.level });
    if (!levelExists) {
      throw new Error("Invalid level specified");
    }

    // Validate size exists
    const Size = mongoose.model("Size");
    const sizeExists = await Size.findOne({ size: this.size });
    if (!sizeExists) {
      throw new Error("Invalid size specified");
    }

    // Validate raw materials
    const Category = mongoose.model("Category");
    const Unit = mongoose.model("Unit");
    const RawMaterialType = mongoose.model("RawMaterialType");

    for (const material of this.rawMaterialsUsed) {
      // Validate category
      const categoryExists = await Category.findOne({
        category: material.category,
      });
      if (!categoryExists) {
        throw new Error(`Invalid category: ${material.category}`);
      }

      // Validate type
      const typeExists = await RawMaterialType.findOne({ name: material.type });
      if (!typeExists) {
        throw new Error(`Invalid raw material type: ${material.type}`);
      }

      // Validate unit
      const unitExists = await Unit.findOne({ unit: material.unit });
      if (!unitExists) {
        throw new Error(`Invalid unit: ${material.unit}`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const ProductType = mongoose.model("ProductType", productTypeSchema);

export default ProductType;
