import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (err: any) {
    throw new Error(`❌ Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};
