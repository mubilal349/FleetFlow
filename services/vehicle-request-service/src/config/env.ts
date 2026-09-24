import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const jwtSecret = getRequiredEnv("JWT_SECRET");

console.log(
  "🔐 VEHICLE REQUEST JWT SECRET CHECK:",
  jwtSecret.length,
  jwtSecret.slice(0, 3),
  jwtSecret.slice(-3),
);

export const env = {
  PORT: Number(process.env.PORT || 4003),
  HOST: process.env.HOST || "0.0.0.0",

  MONGODB_URI: getRequiredEnv("MONGODB_URI"),

  JWT_SECRET: jwtSecret,

  VEHICLE_SERVICE_URL:
    process.env.VEHICLE_SERVICE_URL || "http://localhost:4002",
};
