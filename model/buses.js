import mongoose from "mongoose";
const Schema = mongoose.Schema;
const busSchema = Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    sits: {
      type: Number,
      required: true,
    },
    plate: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
const Bus = mongoose.model("Bus", busSchema);
export { Bus };
