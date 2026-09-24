import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { vehicleRoutes } from "./routes/vehicleRoutes.js";

const app = Fastify({
  logger: true,
});

async function startServer() {
  try {
    await app.register(cors, {
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      origin: true,
      credentials: true,
    });

    console.log("✅ CORS configured with PATCH + DELETE");

    await app.register(authRoutes);
    await app.register(vehicleRoutes);

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🌐 API Gateway running on http://localhost:${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

startServer();
