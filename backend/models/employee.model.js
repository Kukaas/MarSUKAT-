import mongoose from "mongoose";

const positionEnum = [
  "Pattern Maker",
  "Tailoring Specialist",
  "Cutting Specialist",
  "Sewing Machine Operator",
  "Quality Control Inspector",
  "Garment Technician",
  "Embroidery Specialist",
  "Finishing Specialist",
  "Alteration Specialist",
  "Production Supervisor"
];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    positions: [{
      type: String,
      enum: positionEnum,
      required: true,
    }],
    province: {
      type: String,
      required: true,
      default: "Marinduque" // Since we're only dealing with Marinduque
    },
    municipality: {
      type: String,
      required: true,
    },
    barangay: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      filename: {
        type: String,
        default: "default-employee",
      },
      contentType: {
        type: String,
        default: "image/png",
      },
      data: {
        type: String,
        default: "", // Will store base64 data URL
      },
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate employeeId
employeeSchema.pre("save", async function (next) {
  if (!this.employeeId) {
    const year = new Date().getFullYear();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.employeeId = `EMP-${year}-${randomString}`;
  }
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee; 