import { FastifyReply, FastifyRequest } from "fastify";

import {
  loginUser,
  registerUser,
  getUsers as getUsersService,
} from "../services/authService.js";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface GetUsersQuery {
  role?: "admin" | "manager" | "driver" | "customer";
  limit?: string;
}

export const register = async (
  request: FastifyRequest<{
    Body: RegisterBody;
  }>,
  reply: FastifyReply,
) => {
  try {
    console.log("🟢 Register request body:", {
      name: request.body?.name,
      email: request.body?.email,
      hasPassword: Boolean(request.body?.password),
    });

    const { name, email, password } = request.body;

    const result = await registerUser({
      name,
      email,
      password,
    });

    console.log("🟢 User registered successfully:", result.user);

    return reply.code(201).send({
      success: true,
      message: "Account created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("🔴 REGISTER CONTROLLER ERROR:", error);

    if (error instanceof Error) {
      console.error("🔴 MESSAGE:", error.message);
      console.error("🔴 STACK:", error.stack);
    }

    const message =
      error instanceof Error ? error.message : "Registration failed.";

    const statusCode =
      message.includes("already exists") ||
      message.includes("required") ||
      message.includes("at least")
        ? 400
        : 500;

    return reply.code(statusCode).send({
      success: false,
      message,
    });
  }
};

export const login = async (
  request: FastifyRequest<{
    Body: LoginBody;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { email, password } = request.body;

    const result = await loginUser({
      email,
      password,
    });

    return reply.code(200).send({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";

    const statusCode = message === "Invalid email or password." ? 401 : 400;

    return reply.code(statusCode).send({
      success: false,
      message,
    });
  }
};

export const getUsers = async (
  request: FastifyRequest<{
    Querystring: GetUsersQuery;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { role, limit } = request.query;

    const organizationId = request.user.organizationId;

    if (!organizationId) {
      return reply.code(400).send({
        success: false,
        message: "User organization is missing.",
      });
    }

    const parsedLimit = limit ? Number(limit) : 100;

    if (!Number.isFinite(parsedLimit)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid limit.",
      });
    }

    const result = await getUsersService({
      organizationId,
      role,
      limit: parsedLimit,
    });

    return reply.code(200).send({
      success: true,
      message: "Users retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("🔴 GET USERS CONTROLLER ERROR:", error);

    if (error instanceof Error) {
      console.error("🔴 MESSAGE:", error.message);
      console.error("🔴 STACK:", error.stack);
    }

    return reply.code(500).send({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to retrieve users.",
    });
  }
};
