import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined.`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT || 4002),
  HOST: process.env.HOST || "0.0.0.0",
  MONGODB_URI: getRequiredEnv("MONGODB_URI"),
  JWT_SECRET: getRequiredEnv("JWT_SECRET"),
  VEHICLE_SERVICE_URL:
    process.env.VEHICLE_SERVICE_URL || "http://localhost:4001",
};
