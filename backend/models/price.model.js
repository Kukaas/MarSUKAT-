import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    priceId: {
      type: String,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          // Check if it's a valid number with exactly 2 decimal places
          return /^\d+\.\d{2}$/.test(v.toFixed(2));
        },
        message: (props) =>
          `${props.value} is not a valid price. Price must have exactly 2 decimal places.`,
      },
      set: (v) => Number(v.toFixed(2)), // Ensure the value is stored with 2 decimal places
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate priceId
priceSchema.pre("save", async function (next) {
  if (!this.priceId) {
    const year = new Date().getFullYear();
    const count = (await mongoose.model("Price").countDocuments()) + 1;
    this.priceId = `PRC-${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const Price = mongoose.model("Price", priceSchema);

export default Price;
