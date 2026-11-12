import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

reviewSchema.index(
  { item: 1, author: 1 },
  { unique: true, partialFilterExpression: { author: { $type: "objectId" } } },
);

export const Review = mongoose.model("Review", reviewSchema);
