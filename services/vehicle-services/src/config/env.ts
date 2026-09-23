import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 4002),

  HOST: process.env.HOST || "0.0.0.0",

  MONGODB_URI: requiredEnv("MONGODB_URI"),

  JWT_SECRET: requiredEnv("JWT_SECRET"),

  API_GATEWAY_URL: process.env.API_GATEWAY_URL || "http://localhost:4000",
};
