import type { FastifyReply, FastifyRequest } from "fastify";

import type { JwtPayload, UserRole } from "./authMiddleware.js";

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      reply.status(401).send({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (!allowedRoles.includes(user.role)) {
      reply.status(403).send({
        success: false,
        message: "You do not have permission to perform this action",
      });

      return;
    }
  };
}
