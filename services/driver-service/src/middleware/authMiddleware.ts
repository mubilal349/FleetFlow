import type { FastifyRequest } from "fastify";

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

export async function authenticate(request: FastifyRequest): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw {
      statusCode: 401,
      message: "Unauthorized",
    };
  }
}
