import mongoose from "mongoose";

const academicGownProductionSchema = new mongoose.Schema(
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
academicGownProductionSchema.pre("save", async function (next) {
  try {
    // Generate productionId if not exists
    if (!this.productionId) {
      const year = new Date().getFullYear();
      const randomString = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      this.productionId = `GOWN-${year}-${randomString}`;
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

// Static method to generate material usage report
academicGownProductionSchema.statics.generateMaterialUsageReport = async function(startDate, endDate, category, type) {
  const query = {
    productionDateFrom: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  // Add material filters if provided
  if (category || type) {
    if (category) {
      query['rawMaterialsUsed.category'] = category;
    }
    if (type) {
      query['rawMaterialsUsed.type'] = type;
    }
  }
  
  const productions = await this.find(query);
  
  // Track usage by material
  const materialUsage = {};
  
  // Process each production record
  productions.forEach(production => {
    production.rawMaterialsUsed.forEach(material => {
      const materialKey = `${material.category}-${material.type}`;
      
      if (!materialUsage[materialKey]) {
        materialUsage[materialKey] = {
          category: material.category,
          type: material.type,
          totalQuantity: 0,
          unit: material.unit,
          usageByProduct: {},
          monthlyUsage: {}
        };
      }
      
      // Calculate total used in this production
      const quantityUsed = parseFloat(material.quantity) * production.quantity;
      materialUsage[materialKey].totalQuantity += quantityUsed;
      
      // Track usage by product type
      const productKey = `${production.level}-${production.productType}-${production.size}`;
      if (!materialUsage[materialKey].usageByProduct[productKey]) {
        materialUsage[materialKey].usageByProduct[productKey] = 0;
      }
      materialUsage[materialKey].usageByProduct[productKey] += quantityUsed;
      
      // Track usage by month
      const month = new Date(production.productionDateFrom).getMonth() + 1;
      const year = new Date(production.productionDateFrom).getFullYear();
      const monthKey = `${year}-${month}`;
      
      if (!materialUsage[materialKey].monthlyUsage[monthKey]) {
        materialUsage[materialKey].monthlyUsage[monthKey] = 0;
      }
      materialUsage[materialKey].monthlyUsage[monthKey] += quantityUsed;
    });
  });
  
  // Convert to array and format for easier consumption
  const result = Object.values(materialUsage).map(item => {
    return {
      ...item,
      usageByProduct: Object.entries(item.usageByProduct).map(([key, value]) => {
        const [level, type, size] = key.split('-');
        return { level, type, size, quantity: value };
      }),
      monthlyUsage: Object.entries(item.monthlyUsage).map(([key, value]) => {
        const [year, month] = key.split('-');
        return { year: parseInt(year), month: parseInt(month), quantity: value };
      })
    };
  });
  
  return result;
};

const AcademicGownProduction = mongoose.model(
  "AcademicGownProduction",
  academicGownProductionSchema
);

export default AcademicGownProduction; 