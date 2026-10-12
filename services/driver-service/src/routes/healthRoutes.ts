import type { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    return {
      success: true,
      service: "fleetflow-driver-service",
      status: "healthy",
    };
  });
}
