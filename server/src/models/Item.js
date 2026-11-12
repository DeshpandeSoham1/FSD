import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    code: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null },
    images: { type: [String], default: [] },
    includes: { type: [String], default: [] },
    originalPrice: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    deposit: { type: Number, required: true },
    condition: { type: String, enum: ["New", "Good", "Fair"], required: true },
    location: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ownerName: { type: String, required: true },
    ownerRating: { type: Number, default: null },
    available: { type: Boolean, default: true },
    availableFrom: { type: Date, required: true },
    availableTo: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Item = mongoose.model("Item", itemSchema);
