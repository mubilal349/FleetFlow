import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "node:path";

import { env } from "./config/env.js";

import { driverRoutes } from "./routes/driverRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Security headers.
  // Allow the frontend at localhost:3000 to display driver images
  // served by this service on localhost:4009.
  await app.register(helmet, {
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  });

  // Allow requests from the FleetFlow frontend.
  await app.register(cors, {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  // JWT authentication.
  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Enable multipart image uploads (one file, maximum 5 MB).
  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: 5 * 1024 * 1024,
    },
  });

  // Serve uploaded driver images at /uploads/*
  const uploadsDirectory = path.resolve(process.cwd(), "uploads");

  await app.register(fastifyStatic, {
    root: uploadsDirectory,
    prefix: "/uploads/",
  });

  // Application routes.
  await app.register(healthRoutes);
  await app.register(driverRoutes);

  // Centralized error handler.
  app.setErrorHandler(
    (error: Error & { statusCode?: number }, request, reply) => {
      request.log.error(error);

      const statusCode = error.statusCode ?? 500;

      return reply.code(statusCode).send({
        success: false,
        message: statusCode >= 500 ? "Internal server error" : error.message,
      });
    },
  );

  return app;
}
