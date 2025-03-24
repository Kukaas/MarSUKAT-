import mongoose from "mongoose";

const academicGownInventorySchema = new mongoose.Schema(
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
    status: {
      type: String,
      required: true,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
    image: {
      filename: {
        type: String,
        default: "default-gown",
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
    lastUpdated: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

// Pre-save middleware to generate inventoryId and validate references
academicGownInventorySchema.pre("save", async function (next) {
  try {
    // Generate inventoryId if not exists
    if (!this.inventoryId) {
      const year = new Date().getFullYear();
      const randomString = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      this.inventoryId = `GOWN-${year}-${randomString}`;
    }

    // Update lastUpdated timestamp
    this.lastUpdated = new Date();

    // Update status based on quantity
    if (this.quantity <= 0) {
      this.status = "Out of Stock";
    } else if (this.quantity <= 20) {
      this.status = "Low Stock";
    } else {
      this.status = "Available";
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

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to generate inventory report
academicGownInventorySchema.statics.generateInventoryReport = async function(query = {}) {
  const inventoryItems = await this.find(query);
  
  // Group by status
  const statusSummary = {
    Available: 0,
    "Low Stock": 0,
    "Out of Stock": 0
  };

  // Group by level and product type
  const levelSummary = {};
  const productTypeSummary = {};
  
  inventoryItems.forEach(item => {
    // Update status counts
    statusSummary[item.status]++;
    
    // Update level summary
    if (!levelSummary[item.level]) {
      levelSummary[item.level] = {
        totalQuantity: 0,
        items: []
      };
    }
    levelSummary[item.level].totalQuantity += item.quantity;
    levelSummary[item.level].items.push({
      productType: item.productType,
      size: item.size,
      quantity: item.quantity,
      status: item.status
    });
    
    // Update product type summary
    if (!productTypeSummary[item.productType]) {
      productTypeSummary[item.productType] = {
        totalQuantity: 0,
        sizes: {}
      };
    }
    productTypeSummary[item.productType].totalQuantity += item.quantity;
    
    if (!productTypeSummary[item.productType].sizes[item.size]) {
      productTypeSummary[item.productType].sizes[item.size] = 0;
    }
    productTypeSummary[item.productType].sizes[item.size] += item.quantity;
  });
  
  return {
    totalItems: inventoryItems.length,
    statusSummary,
    levelSummary,
    productTypeSummary
  };
};

const AcademicGownInventory = mongoose.model(
  "AcademicGownInventory",
  academicGownInventorySchema
);

export default AcademicGownInventory; 