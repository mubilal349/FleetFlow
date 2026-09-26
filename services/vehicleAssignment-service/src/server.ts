import { buildApp } from "./app.js";

import { connectDatabase, disconnectDatabase } from "./config/db.js";

import { env } from "./config/env.js";

const app = buildApp();

async function startServer() {
  try {
    await connectDatabase();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(
      `Vehicle Assignment Service running on http://localhost:${env.PORT}`,
    );
  } catch (error) {
    console.error("Failed to start Vehicle Assignment Service:", error);

    process.exit(1);
  }
}

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down...`);

  await app.close();
  await disconnectDatabase();

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
