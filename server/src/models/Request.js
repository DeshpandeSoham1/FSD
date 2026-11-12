import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "ACTIVE", "COMPLETED", "DISPUTED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Request = mongoose.model("Request", requestSchema);
