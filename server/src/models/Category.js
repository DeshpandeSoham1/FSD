import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  cover: { type: String, required: true },
});

export const Category = mongoose.model("Category", categorySchema);
