import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import mongoose from "mongoose";

import { env } from "./config/env.js";
import { vehicleRequestRoutes } from "./routes/vehicleRequestRoutes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: "http://localhost:3000",
    credentials: true,
  });

  await mongoose.connect(env.MONGODB_URI);

  app.get("/health", async () => {
    return {
      success: true,
      service: "vehicle-request-service",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });

  await app.register(vehicleRequestRoutes);

  return app;
}
