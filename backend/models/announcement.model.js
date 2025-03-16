import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    announcementId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate announcementId
announcementSchema.pre("save", async function (next) {
  if (!this.announcementId) {
    const year = new Date().getFullYear();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    this.announcementId = `ANC-${year}-${randomString}`;
  }
  next();
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
