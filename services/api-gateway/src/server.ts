import "dotenv/config";

import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    const app = await buildApp();

    await app.listen({
      port: PORT,
      host: HOST,
    });

    console.log(`🚚 FleetFlow API Gateway running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Failed to start API Gateway:", error);

    process.exit(1);
  }
};

startServer();
