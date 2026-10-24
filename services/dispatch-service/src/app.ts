import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";

import { env } from "./config/env.js";
import { registerErrorHandler } from "./plugins/errorHandler.js";
import { dispatchRoutes } from "./routes/dispatchRoutes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      redact: ["req.headers.authorization", "req.headers.cookie"],
    },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
  });

  await app.register(helmet);

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  registerErrorHandler(app);

  app.get("/health", async () => ({
    success: true,
    service: "dispatch-service",
    status: "healthy",
  }));

  await app.register(dispatchRoutes, {
    prefix: "/dispatches",
  });

  return app;
}
