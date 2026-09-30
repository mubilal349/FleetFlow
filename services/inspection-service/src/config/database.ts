import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("Inspection Service connected to MongoDB successfully.");
  } catch (error) {
    console.error("Inspection Service failed to connect to MongoDB:", error);

    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();

    console.log("Inspection Service disconnected from MongoDB.");
  } catch (error) {
    console.error("Failed to disconnect from MongoDB:", error);
  }
}
