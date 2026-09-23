import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { healthRoutes } from "./routes/healthRoutes.js";

const app = Fastify({
  logger: true,
});

async function startServer() {
  try {
    await connectDatabase();

    await app.register(cors, {
      origin: true,
      credentials: true,
    });

    await app.register(healthRoutes);

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚗 Vehicle Service running on http://localhost:${env.PORT}`);
  } catch (error) {
    app.log.error(error);

    process.exit(1);
  }
}

startServer();
