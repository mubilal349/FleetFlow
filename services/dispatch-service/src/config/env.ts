import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(4011),

  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  API_GATEWAY_URL: z.string().url().default("http://localhost:4000"),

  VEHICLE_SERVICE_URL: z.string().url().default("http://localhost:4002"),

  VEHICLE_ASSIGNMENT_SERVICE_URL: z
    .string()
    .url()
    .default("http://localhost:4005"),

  DRIVER_SERVICE_URL: z.string().url().default("http://localhost:4009"),

  TRIP_SERVICE_URL: z.string().url().default("http://localhost:4010"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid Dispatch Service environment configuration:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  throw new Error("Dispatch Service environment validation failed");
}

export const env = parsedEnv.data;
