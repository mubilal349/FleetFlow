import type { FastifyInstance } from "fastify";
import proxy from "@fastify/http-proxy";

import { env } from "../config/env.js";

export async function vehicleRoutes(fastify: FastifyInstance) {
  await fastify.register(proxy, {
    upstream: env.VEHICLE_SERVICE_URL,
    prefix: "/api/vehicles",
    rewritePrefix: "/vehicles",
  });
}
