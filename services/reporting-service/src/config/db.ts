import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase() {
  try {
    if (!env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables.",
      );
    }

    await mongoose.connect(env.MONGODB_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    throw error;
  }
}
