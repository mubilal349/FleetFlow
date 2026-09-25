import type { FastifyReply, FastifyRequest } from "fastify";

export type UserRole = "admin" | "manager" | "driver" | "customer";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify<JwtPayload>();
  } catch (error) {
    request.log.warn({ error }, "Authentication failed");

    reply.status(401).send({
      success: false,
      message: "Authentication required",
    });

    return;
  }
}
