import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import proxy from "@fastify/http-proxy";

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: "http://localhost:3000",
    credentials: true,
  });

  app.get("/health", async () => {
    return {
      success: true,
      service: "api-gateway",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });

  const authServiceUrl =
    process.env.AUTH_SERVICE_URL || "http://localhost:4001";

  await app.register(proxy, {
    upstream: authServiceUrl,
    prefix: "/api/auth",
    rewritePrefix: "/auth",
  });

  return app;
};
