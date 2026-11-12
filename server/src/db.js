import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI || (process.env.VERCEL ? "" : "mongodb://127.0.0.1:27017/borrowbox");
  if (!uri) throw new Error("MONGODB_URI is not set.");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return mongoose.connection;
}
