import mongoose from "mongoose";

const schoolUniformProductionSchema = new mongoose.Schema(
  {
    productionId: {
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
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (props) => `${props.value} must be a whole number`,
      },
    },
    productionDateFrom: {
      type: Date,
      required: true,
    },
    productionDateTo: {
      type: Date,
      required: true,
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

// Pre-save middleware to generate productionId and validate references
schoolUniformProductionSchema.pre("save", async function (next) {
  try {
    // Generate productionId if not exists
    if (!this.productionId) {
      const year = new Date().getFullYear();
      const randomString = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      this.productionId = `PROD-${year}-${randomString}`;
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

const SchoolUniformProduction = mongoose.model(
  "SchoolUniformProduction",
  schoolUniformProductionSchema
);

export default SchoolUniformProduction;
