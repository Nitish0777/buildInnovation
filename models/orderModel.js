import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    status: {
      type: String,
      default: "pending",
      enum: [
        "pending",
        "processing",
        "Shipped",
        "Delivereds",
        "cancelled",
        "refunded",
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
