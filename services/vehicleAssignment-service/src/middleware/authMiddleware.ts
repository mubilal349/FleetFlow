import type { FastifyReply, FastifyRequest } from "fastify";

import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";

export type UserRole = "admin" | "manager" | "driver" | "customer";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    authUser: AuthenticatedUser;
  }
}

export function getAuthenticatedUser(
  request: FastifyRequest,
): AuthenticatedUser {
  return request.authUser;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return reply.status(401).send({
        success: false,
        message: "Authentication required.",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return reply.status(401).send({
        success: false,
        message: "Invalid authorization header.",
        code: "INVALID_AUTHORIZATION_HEADER",
      });
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: "Authentication token is missing.",
        code: "TOKEN_MISSING",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

    if (
      !decoded.id ||
      !decoded.email ||
      !decoded.role ||
      !decoded.organizationId
    ) {
      return reply.status(401).send({
        success: false,
        message: "Invalid authentication token.",
        code: "INVALID_TOKEN_PAYLOAD",
      });
    }

    request.authUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };
  } catch (error) {
    request.log.warn({ error }, "JWT authentication failed");

    return reply.status(401).send({
      success: false,
      message: "Invalid or expired authentication token.",
      code: "INVALID_OR_EXPIRED_TOKEN",
    });
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = getAuthenticatedUser(request);

      if (!allowedRoles.includes(user.role)) {
        return reply.status(403).send({
          success: false,
          message: "You do not have permission to perform this action.",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }
    } catch {
      return reply.status(401).send({
        success: false,
        message: "Authentication required.",
        code: "AUTHENTICATION_REQUIRED",
      });
    }
  };
}

export function getBearerToken(request: FastifyRequest): string {
  const authorization = request.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("Authorization token is missing.");
  }

  return authorization.substring(7).trim();
}
