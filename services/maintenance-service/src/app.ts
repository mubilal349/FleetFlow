import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import maintenanceAlertRoutes from "./routes/maintenanceAlertRoutes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.get("/health", async () => {
    return {
      success: true,
      service: "maintenance-service",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });

  app.get("/", async () => {
    return {
      success: true,
      service: "FleetFlow Maintenance Service",
      version: "1.0.0",
      message: "Maintenance service is running",
    };
  });

  // Maintenance routes
  await app.register(maintenanceRoutes);

  // Maintenance alert routes
  await app.register(maintenanceAlertRoutes);

  // Debug registered routes
  console.log("========== MAINTENANCE SERVICE ROUTES ==========");
  console.log(app.printRoutes());
  console.log("================================================");

  return app;
}
