import mongoose from "mongoose";

export const connectDB = async () => {
  try {
      const uri = process.env.MONGO_URI;

          if (!uri) {
                throw new Error("MONGO_URI not found in env");
                    }

                        await mongoose.connect(uri);

                            console.log("🟢 MongoDB connected successfully");
                              } catch (err) {
                                  console.error("❌ DB connection error:", err);
                                      process.exit(1);
                                        }
                                        };