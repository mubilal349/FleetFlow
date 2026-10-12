import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("✅ Driver Service connected to MongoDB");
  } catch (error) {
    console.error("❌ Driver Service MongoDB connection failed:", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
