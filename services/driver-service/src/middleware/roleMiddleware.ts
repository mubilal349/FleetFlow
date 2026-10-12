import type { FastifyRequest } from "fastify";

import type { AuthenticatedUser } from "./authMiddleware.js";

export function requireRoles(...allowedRoles: string[]) {
  return async (request: FastifyRequest) => {
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      throw {
        statusCode: 403,
        message: "Forbidden: insufficient permissions",
      };
    }
  };
}
