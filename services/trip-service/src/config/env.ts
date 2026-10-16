import "dotenv/config";

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const port = Number(process.env.PORT ?? 4006);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: port,
  HOST: process.env.HOST ?? "0.0.0.0",
  MONGODB_URI: required("MONGODB_URI"),
  MONGODB_DB: process.env.MONGODB_DB ?? "fleetflow_trips",
  JWT_SECRET: required("JWT_SECRET"),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
