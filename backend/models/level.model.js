import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    levelId: {
      type: String,
      unique: true,
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
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.levelId = `LVL-${year}-${randomString}`;
  }
  next();
});

const Level = mongoose.model("Level", levelSchema);

export default Level;
