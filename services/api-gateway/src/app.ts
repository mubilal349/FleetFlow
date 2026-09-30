import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import proxy from "@fastify/http-proxy";

export const buildApp = async () => {
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

  app.get("/health", async () => {
    return {
      success: true,
      service: "api-gateway",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });

  // =========================
  // Auth Service
  // =========================

  const authServiceUrl =
    process.env.AUTH_SERVICE_URL || "http://localhost:4001";

  await app.register(proxy, {
    upstream: authServiceUrl,
    prefix: "/api/auth",
    rewritePrefix: "/auth",
  });

  await app.register(proxy, {
    upstream: authServiceUrl,
    prefix: "/api/users",
    rewritePrefix: "/auth/users",
  });

  // =========================
  // Vehicle Service
  // =========================

  const vehicleServiceUrl =
    process.env.VEHICLE_SERVICE_URL || "http://localhost:4002";

  await app.register(proxy, {
    upstream: vehicleServiceUrl,
    prefix: "/api/vehicles",
    rewritePrefix: "/vehicles",
  });

  // =========================
  // Vehicle Request Service
  // =========================

  const vehicleRequestServiceUrl =
    process.env.VEHICLE_REQUEST_SERVICE_URL || "http://localhost:4003";

  await app.register(proxy, {
    upstream: vehicleRequestServiceUrl,
    prefix: "/api/vehicle-requests",
    rewritePrefix: "/vehicle-requests",
  });

  // =========================
  // Vehicle Assignment Service
  // =========================

  const vehicleAssignmentServiceUrl =
    process.env.VEHICLE_ASSIGNMENT_SERVICE_URL || "http://localhost:4005";

  await app.register(proxy, {
    upstream: vehicleAssignmentServiceUrl,
    prefix: "/api/assignments",
    rewritePrefix: "/assignments",
  });

  // =========================
  // Inspection Service
  // =========================

  const inspectionServiceUrl =
    process.env.INSPECTION_SERVICE_URL || "http://localhost:4006";

  await app.register(proxy, {
    upstream: inspectionServiceUrl,
    prefix: "/api/inspections",
    rewritePrefix: "/inspections",
  });

  // =========================
  // Gateway Routes
  // =========================

  console.log("========== API GATEWAY ROUTES ==========");
  console.log(app.printRoutes());
  console.log("========================================");

  return app;
};
