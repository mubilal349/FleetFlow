import { buildApp } from "./app.js";
import { closeDatabase, connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer() {
  const app = await buildApp();

  try {
    await connectDatabase();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`Trip Service running on http://localhost:${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    await closeDatabase();
    await app.close();
    process.exitCode = 1;
  }

  const shutdown = async (signal: string) => {
    app.log.info(`${signal} received. Shutting down Trip Service.`);

    try {
      await app.close();
      await closeDatabase();
      process.exitCode = 0;
    } catch (error) {
      app.log.error(error);
      process.exitCode = 1;
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

void startServer();
