import { FastifyReply, FastifyRequest } from "fastify";

import { loginUser, registerUser } from "../services/authService.js";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const register = async (
  request: FastifyRequest<{
    Body: RegisterBody;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { name, email, password } = request.body;

    const result = await registerUser({
      name,
      email,
      password,
    });

    return reply.code(201).send({
      success: true,
      message: "Account created successfully.",
      data: result,
    });
  } catch (error) {
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
