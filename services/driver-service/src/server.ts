import { buildApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer() {
  const app = await buildApp();

  try {
    await connectDatabase();

    await app.ready();

    console.log("========== DRIVER SERVICE ROUTES ==========");
    console.log(app.printRoutes());
    console.log("============================================");

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚚 Driver Service running on http://localhost:${env.PORT}`);
  } catch (error) {
    app.log.error(error);

    try {
      await app.close();
      await disconnectDatabase();
    } catch (shutdownError) {
      app.log.error(shutdownError);
    }

    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down Driver Service...`);

    try {
      await app.close();
      await disconnectDatabase();
      process.exit(0);
    } catch (error) {
      app.log.error(error);
      process.exit(1);
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

void startServer();
