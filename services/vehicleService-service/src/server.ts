import "dotenv/config";

import { buildApp } from "./app.js";
import { connectDB } from "./config/env.js";

const app = buildApp();

const PORT = Number(process.env.PORT) || 4004;
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  try {
    await connectDB();

    await app.listen({
      port: PORT,
      host: HOST,
    });

    console.log(
      `🚀 FleetFlow Service Service running on http://localhost:${PORT}`,
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

startServer();
