import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import { authRoutes } from "./routes/authRoutes.js";

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: "http://localhost:3000",
    credentials: true,
  });

  app.get("/health", async () => {
    return {
      success: true,
      service: "auth-service",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });

  await app.register(authRoutes, {
    prefix: "/auth",
  });

  return app;
};
