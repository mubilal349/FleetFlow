import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT || 4000),
  HOST: process.env.HOST || "0.0.0.0",

  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:4001",

  VEHICLE_SERVICE_URL:
    process.env.VEHICLE_SERVICE_URL || "http://localhost:4002",
};
