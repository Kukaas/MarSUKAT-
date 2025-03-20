import mongoose from "mongoose";

const salesReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
      ref: "StudentOrder",
    },
    studentName: {
      type: String,
      required: true,
    },
    studentNumber: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    orderItems: [{
      level: String,
      productType: String,
      size: String,
      unitPrice: {
        type: Number,
        validate: {
          validator: function (v) {
            return /^\d+\.\d{2}$/.test(parseFloat(v).toFixed(2));
          },
          message: (props) =>
            `${props.value} is not a valid price. Price must have exactly 2 decimal places.`,
        },
        set: (v) => parseFloat(v),
      },
      quantity: {
        type: Number,
        min: [1, "Quantity must be at least 1"],
      },
      subtotal: {
        type: Number,
        validate: {
          validator: function (v) {
            return /^\d+\.\d{2}$/.test(parseFloat(v).toFixed(2));
          },
          message: (props) =>
            `${props.value} is not a valid subtotal. Subtotal must have exactly 2 decimal places.`,
        },
        set: (v) => parseFloat(v),
      },
    }],
    totalAmount: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d+\.\d{2}$/.test(parseFloat(v).toFixed(2));
        },
        message: (props) =>
          `${props.value} is not a valid total amount. Total amount must have exactly 2 decimal places.`,
      },
      set: (v) => parseFloat(v),
    },
    dateClaimed: {
      type: Date,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate report ID before saving
salesReportSchema.pre("save", async function (next) {
  try {
    if (!this.reportId) {
      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
      const randomString = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      this.reportId = `SR-${year}${month}-${randomString}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const SalesReport = mongoose.model("SalesReport", salesReportSchema);

export default SalesReport; 