import type { FastifyReply, FastifyRequest } from "fastify";

import type { UserRole } from "./authMiddleware.js";

export function requireRoles(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: "Authentication required.",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        message: "You do not have permission to perform this action.",
        code: "FORBIDDEN",
      });
    }
  };
}
