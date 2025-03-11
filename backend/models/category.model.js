import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate categoryId
categorySchema.pre("save", async function (next) {
  if (!this.categoryId) {
    const year = new Date().getFullYear();
    const count = (await mongoose.model("Category").countDocuments()) + 1;
    this.categoryId = `CAT-${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
