import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDatabase, connectDatabase } from "./models/dispatchModel.js";

async function startServer(): Promise<void> {
  const app = await buildApp();

  try {
    await connectDatabase();

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    app.log.info(`Dispatch Service listening on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error, "Failed to start Dispatch Service");

    await closeDatabase();
    await app.close();

    process.exitCode = 1;
  }

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}; shutting down`);

    try {
      await app.close();
      await closeDatabase();
      process.exit(0);
    } catch (error) {
      app.log.error(error, "Error during shutdown");
      process.exit(1);
    }
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void startServer();
