import { buildApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const start = async () => {
  try {
    await connectDatabase();

    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(
      `🚗 Maintenance Service running on http://localhost:${env.PORT}`,
    );
  } catch (error) {
    console.error("❌ Failed to start Maintenance Service", error);

    process.exit(1);
  }
};

start();
