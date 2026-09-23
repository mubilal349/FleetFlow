import { FastifyReply, FastifyRequest } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";

import { UserRole } from "../models/User.js";

interface AccessTokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
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

    const token = authorization.substring(7);

    if (!token) {
      return reply.code(401).send({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as AccessTokenPayload;

    if (!decoded.userId || !decoded.email || !decoded.role) {
      return reply.code(401).send({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    request.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return reply.code(401).send({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};
