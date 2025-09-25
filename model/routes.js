import mongoose from "mongoose";
const Schema = mongoose.Schema;
const routeSchema = Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
    },
    departurePlace: {
      type: String,
      required: true,
    },
    arrivalPlace: {
      type: String,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Route = mongoose.model("Route", routeSchema);
export { Route };
