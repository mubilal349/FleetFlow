import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI);

  console.log("Vehicle Assignment Service MongoDB connected.");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();

  console.log("Vehicle Assignment Service MongoDB disconnected.");
}
