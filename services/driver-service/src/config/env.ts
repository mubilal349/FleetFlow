import "dotenv/config";

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: Number(getEnv("PORT", "4007")),

  HOST: getEnv("HOST", "0.0.0.0"),

  MONGODB_URI: getEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/fleetflow"),

  JWT_SECRET: getEnv("JWT_SECRET", "development-secret"),

  AUTH_SERVICE_URL: getEnv("AUTH_SERVICE_URL", "http://localhost:4001"),

  VEHICLE_SERVICE_URL: getEnv("VEHICLE_SERVICE_URL", "http://localhost:4002"),
};
