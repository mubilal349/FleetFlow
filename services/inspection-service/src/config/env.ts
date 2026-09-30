import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 4006,

  MONGODB_URI: getRequiredEnv("MONGODB_URI"),

  JWT_SECRET: getRequiredEnv("JWT_SECRET"),

  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:4001",

  VEHICLE_SERVICE_URL:
    process.env.VEHICLE_SERVICE_URL || "http://localhost:4002",
};
