import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";

import serviceRoutes from "./routes/serviceRoutes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(helmet);

  app.register(cors, {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],

    credentials: true,
  });

  app.register(jwt, {
    secret: process.env.JWT_SECRET || "development-secret",
  });

  app.get("/health", async () => {
    return {
      success: true,
      service: "fleetflow-service-service",
      status: "healthy",
    };
  });

  app.register(serviceRoutes, {
    prefix: "/services",
  });

  return app;
}
