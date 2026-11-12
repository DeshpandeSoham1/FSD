import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  code: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
});

export const Club = mongoose.model("Club", clubSchema);
