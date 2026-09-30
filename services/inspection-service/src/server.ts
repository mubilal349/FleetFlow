import "dotenv/config";

import { buildApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = buildApp();

async function startServer() {
  try {
    await connectDatabase();

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log(`Inspection Service running on http://localhost:${env.PORT}`);
  } catch (error) {
    app.log.error(error);

    await disconnectDatabase();

    process.exit(1);
  }
}

async function shutdown(signal: string) {
  try {
    app.log.info(`${signal} received. Shutting down Inspection Service...`);

    await app.close();
    await disconnectDatabase();

    process.exit(0);
  } catch (error) {
    app.log.error({ error }, "Error during Inspection Service shutdown.");

    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
