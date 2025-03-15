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
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.categoryId = `CAT-${year}-${randomString}`;
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
