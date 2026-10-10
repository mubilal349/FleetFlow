import "@fastify/jwt";
import "fastify";

import type { FastifyReply, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email?: string;
      role?: string;
      organizationId?: string;
      orgId?: string;
    };

    user: {
      id: string;
      email?: string;
      role?: string;
      organizationId?: string;
      orgId?: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}
