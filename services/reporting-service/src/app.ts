import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";

import reportingRoutes from "./routes/reportingRoutes.js";
import { env } from "./config/env.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: "http://localhost:3000",
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  app.decorate("authenticate", async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }
  });

  app.get("/health", async () => {
    return {
      success: true,
      service: "reporting-service",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });

  app.get("/", async () => {
    return {
      success: true,
      service: "FleetFlow Reporting & Analytics Service",
      version: "1.0.0",
      message: "Reporting and analytics service is running",
    };
  });

  await app.register(reportingRoutes, {
    preHandler: app.authenticate,
  });

  return app;
}
