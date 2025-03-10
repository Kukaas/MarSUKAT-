import mongoose from "mongoose";

const userVerificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  uniqueString: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    required: true,
  },
});

// Add TTL index to automatically delete expired verification records
userVerificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const UserVerification = mongoose.model(
  "UserVerification",
  userVerificationSchema
);

export default UserVerification;
