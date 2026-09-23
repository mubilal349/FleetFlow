import { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    return {
      success: true,
      service: "vehicle-service",
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  });
}
