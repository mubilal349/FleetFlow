import type { FastifyInstance } from "fastify";
import proxy from "@fastify/http-proxy";
import { env } from "../config/env.js";

export async function authRoutes(fastify: FastifyInstance) {
  await fastify.register(proxy, {
    upstream: env.AUTH_SERVICE_URL,
    prefix: "/api/auth",
    rewritePrefix: "/auth",
  });
}
