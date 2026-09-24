import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(
      `🚗 Vehicle Request Service running on http://localhost:${env.PORT}`,
    );
  } catch (error) {
    console.error("Failed to start Vehicle Request Service:", error);

    process.exit(1);
  }
}

startServer();
