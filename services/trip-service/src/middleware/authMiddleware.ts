import type {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from "fastify";
import type { AuthUser, UserRole } from "../types/auth.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    await reply.code(401).send({
      success: false,
      message: "Authentication required or token is invalid.",
    });
  }
}

export function authorizeRoles(
  ...allowedRoles: UserRole[]
): preHandlerHookHandler {
  return async (request, reply) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      await reply.code(403).send({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
  };
}
