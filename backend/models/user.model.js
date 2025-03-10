import mongoose from "mongoose";

// Base User Schema
const baseOptions = {
  discriminatorKey: "role", // key to differentiate between the different roles
  collection: "users", // collection name
};

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    notifications: [notificationSchema],
  },
  { ...baseOptions, timestamps: true }
);

const User = mongoose.model("User", userSchema);

// After the User model definition and before Student Schema
// SuperAdmin Schema
const superAdminSchema = new mongoose.Schema({
  accessLevel: {
    type: String,
    default: 'full'
  }
});

const SuperAdmin = User.discriminator("SuperAdmin", superAdminSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  studentNumber: {
    type: String,
    required: true,
  },
  studentGender: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
});

const Student = User.discriminator("Student", studentSchema);

// Commercial Job Schema
const commercialJobSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
});

const CommercialJob = User.discriminator("CommercialJob", commercialJobSchema);

// Coordinator Schema
const coordinatorSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
});

const Coordinator = User.discriminator("Coordinator", coordinatorSchema);

export default User;
export { Student, CommercialJob, Coordinator, SuperAdmin };
