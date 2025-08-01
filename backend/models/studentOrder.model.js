import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Down Payment", "Partial Payment", "Full Payment"],
    required: true,
  },
  orNumber: {
    type: String,
    required: true,
  },
  datePaid: {
    type: Date,
    required: true,
  },
  image: {
    filename: String,
    contentType: String,
    data: String,
  },
  amount: {
    type: Number,
    default: 500,
    validate: {
      validator: function (v) {
        return /^\d+\.\d{2}$/.test(parseFloat(v).toFixed(2));
      },
      message: (props) =>
        `${props.value} is not a valid amount. Amount must have exactly 2 decimal places.`,
    },
    set: (v) => parseFloat(v),
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

// Add middleware to handle synchronization
receiptSchema.pre('save', function(next) {
  if (this.isVerified && this.parent().status === "Pending") {
    this.parent().status = "Approved";
  }
  next();
});

const orderItemSchema = new mongoose.Schema({
  level: {
    type: String,
    required: false,
  },
  productType: {
    type: String,
    required: false,
  },
  size: {
    type: String,
    required: false,
  },
  unitPrice: {
    type: Number,
    required: false,
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
    required: false,
    min: [1, "Quantity must be at least 1"],
  },
});

const studentOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    studentNumber: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected", "Measured", "For Pickup", "For Verification", "Payment Verified", "Claimed"],
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    receipts: [receiptSchema],
    orderItems: [orderItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return /^\d+\.\d{2}$/.test(parseFloat(v).toFixed(2));
        },
        message: (props) =>
          `${props.value} is not a valid total price. Total price must have exactly 2 decimal places.`,
      },
      set: (v) => parseFloat(v),
    },
    measurementSchedule: {
      date: Date,
      time: String,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Update pre-save middleware to handle receipt verification
studentOrderSchema.pre("save", async function (next) {
  try {
    if (!this.orderId) {
      const year = new Date().getFullYear();
      const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
      const randomString = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      this.orderId = `SO-${year}${month}-${randomString}`;
    }
    // If order is being approved, verify the latest receipt
    if (this.status === "Approved" && this.receipts.length > 0) {
      const latestReceipt = this.receipts[this.receipts.length - 1];
      if (!latestReceipt.isVerified) {
        latestReceipt.isVerified = true;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to calculate total price
studentOrderSchema.methods.calculateTotalPrice = function () {
  if (this.orderItems && this.orderItems.length > 0) {
    this.totalPrice = this.orderItems.reduce((total, item) => {
      return total + item.unitPrice * item.quantity;
    }, 0);
  }
};

const StudentOrder = mongoose.model("StudentOrder", studentOrderSchema);

export default StudentOrder;
