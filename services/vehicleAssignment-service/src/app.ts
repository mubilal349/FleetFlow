import Fastify from "fastify";
import cors from "@fastify/cors";

import { errorHandler } from "./middleware/errorMiddleware.js";

import { vehicleAssignmentRoutes } from "./routes/vehicleAssignmentRoutes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.get("/health", async () => {
    return {
      success: true,
      service: "vehicleAssignment-service",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });

  app.register(vehicleAssignmentRoutes);

  app.setErrorHandler(errorHandler);

  return app;
}
