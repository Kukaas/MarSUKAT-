import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    levelId: {
      type: String,
      unique: true,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate levelId
levelSchema.pre("save", async function (next) {
  if (!this.levelId) {
    const year = new Date().getFullYear();
    const count = (await mongoose.model("Level").countDocuments()) + 1;
    this.levelId = `${year}-${String(count).padStart(3, "0")}`;
  }
  next();
});

const Level = mongoose.model("Level", levelSchema);

export default Level;
