import { FastifyReply, FastifyRequest } from "fastify";

import { AuthenticatedRequest } from "./authMiddleware.js";

export function requireRoles(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as AuthenticatedRequest).user;

    if (!user) {
      return reply.code(401).send({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!user.role) {
      return reply.code(403).send({
        success: false,
        message: "User role is missing",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return reply.code(403).send({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
  };
}
