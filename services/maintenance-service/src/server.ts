import { buildApp } from "./app.js";

import { connectDatabase } from "./config/database.js";

import { env } from "./config/env.js";

import { startMaintenanceReminderJob } from "./jobs/maintenanceReminderJob.js";

const start = async () => {
  try {
    /**
     * Connect to MongoDB first.
     */
    await connectDatabase();

    /**
     * Build Fastify application.
     */
    const app = await buildApp();

    /**
     * Start Maintenance Service.
     */
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(
      `🚗 Maintenance Service running on http://localhost:${env.PORT}`,
    );

    /**
     * Start automatic maintenance reminder scheduler.
     */
    startMaintenanceReminderJob();
  } catch (error) {
    console.error("❌ Failed to start Maintenance Service", error);

    process.exit(1);
  }
};

start();
