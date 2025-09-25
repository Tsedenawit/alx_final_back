import mongoose from "mongoose";
const Schema = mongoose.Schema;
const userSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "User", "Super-Admin", "Sales-Person"],
    },
    status: {
      type: String,
      required: true,
      default: "Active", // Set default value to "Active"
      enum: ["Active", "Suspended"],
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
export { User };
