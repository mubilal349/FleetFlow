import Fastify from "fastify";
import cors from "@fastify/cors";

import { vehicleInspectionRoutes } from "./routes/vehicleInspectionRoutes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: true,
  });

  // =========================
  // Health Check
  // =========================

  app.get("/health", async () => {
    return {
      success: true,
      service: "fleetflow-inspection-service",
      status: "healthy",
    };
  });

  // =========================
  // Vehicle Inspection Routes
  // =========================

  app.register(vehicleInspectionRoutes);

  return app;
}
