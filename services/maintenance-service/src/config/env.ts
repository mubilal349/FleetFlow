import "dotenv/config";

function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 4007),

  HOST: process.env.HOST || "0.0.0.0",

  MONGODB_URI: getEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/fleetflow"),

  AUTH_SERVICE_URL: getEnv("AUTH_SERVICE_URL", "http://localhost:4001"),

  VEHICLE_SERVICE_URL: getEnv("VEHICLE_SERVICE_URL", "http://localhost:4002"),
} as const;
