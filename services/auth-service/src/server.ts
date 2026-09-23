import "dotenv/config";

import { buildApp } from "./app.js";
import { connectDatabase } from "./config/db.js";

const PORT = Number(process.env.PORT) || 4001;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    await connectDatabase();

    const app = await buildApp();

    await app.listen({
      port: PORT,
      host: HOST,
    });

    console.log(
      `🔐 FleetFlow Auth Service running on http://localhost:${PORT}`,
    );
  } catch (error) {
    console.error("❌ Failed to start Auth Service:", error);

    process.exit(1);
  }
};

startServer();
