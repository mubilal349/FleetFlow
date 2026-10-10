import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 4008,

  HOST: process.env.HOST || "0.0.0.0",

  MONGODB_URI: process.env.MONGODB_URI || "",

  JWT_SECRET: process.env.JWT_SECRET || "fleetflow-development-secret",

  VEHICLE_SERVICE_URL:
    process.env.VEHICLE_SERVICE_URL || "http://localhost:4002",

  VEHICLE_ASSIGNMENT_SERVICE_URL:
    process.env.VEHICLE_ASSIGNMENT_SERVICE_URL || "http://localhost:4005",

  MAINTENANCE_SERVICE_URL:
    process.env.MAINTENANCE_SERVICE_URL || "http://localhost:4007",

  INSPECTION_SERVICE_URL:
    process.env.INSPECTION_SERVICE_URL || "http://localhost:4006",
};
