import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";

import { env } from "./config/env.js";
import { tripRoutes } from "./routes/tripRoutes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: false,
  });

  const allowedOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });

  await app.register(helmet, {
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  app.get("/health", async () => ({
    success: true,
    service: "trip-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  }));

  await app.register(tripRoutes, {
    prefix: "/trips",
  });

  app.setNotFoundHandler(async (_request, reply) => {
    return reply.code(404).send({
      success: false,
      message: "Route not found.",
    });
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    const fastifyError = error as FastifyError;

    if (fastifyError.validation) {
      return reply.code(400).send({
        success: false,
        message: "Validation failed",
        errors: fastifyError.validation,
      });
    }

    const statusCode =
      typeof fastifyError.statusCode === "number" &&
      fastifyError.statusCode >= 400 &&
      fastifyError.statusCode < 600
        ? fastifyError.statusCode
        : 500;

    return reply.code(statusCode).send({
      success: false,
      message:
        statusCode >= 500 ? "Internal server error" : fastifyError.message,
    });
  });

  return app;
}
