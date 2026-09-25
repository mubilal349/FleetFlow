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

interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
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

    console.log(
      "🔑 VEHICLE TOKEN:",
      token.slice(0, 20) + "...",
      "length:",
      token.length,
    );

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: "Authentication token is missing.",
        code: "TOKEN_MISSING",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

    console.log("🔐 DECODED VEHICLE TOKEN:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    });

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

    request.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };
  } catch (error) {
    request.log.warn(
      {
        error,
      },
      "JWT authentication failed",
    );

    return reply.status(401).send({
      success: false,
      message: "Invalid or expired authentication token.",
      code: "INVALID_OR_EXPIRED_TOKEN",
    });
  }
}
