import { FastifyReply, FastifyRequest } from "fastify";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  organizationId?: string;
  orgId?: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    request.log.warn({ error }, "Authentication failed");

    return reply.code(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
}
