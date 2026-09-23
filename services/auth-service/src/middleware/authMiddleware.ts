import type { FastifyReply, FastifyRequest } from "fastify";
import jwt, { type JwtPayload } from "jsonwebtoken";

import type { UserRole } from "../models/User.js";

interface AccessTokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined.");
  }

  return secret;
};

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return reply.code(401).send({
        success: false,
        message: "Authentication token is required.",
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return reply.code(401).send({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      return reply.code(401).send({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as AccessTokenPayload;

    if (
      !decoded.userId ||
      !decoded.email ||
      !decoded.role ||
      !decoded.organizationId
    ) {
      return reply.code(401).send({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    request.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };
  } catch {
    return reply.code(401).send({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};
