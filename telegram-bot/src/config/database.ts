import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
}