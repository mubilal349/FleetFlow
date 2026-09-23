import { FastifyInstance } from "fastify";

import { login, register } from "../controllers/authController.js";

import { authenticate } from "../middleware/authMiddleware.js";

export const authRoutes = async (app: FastifyInstance) => {
  app.post("/register", register);

  app.post("/login", login);

  app.get(
    "/me",
    {
      preHandler: authenticate,
    },
    async (request) => {
      return {
        success: true,
        message: "Authenticated user.",
        data: {
          user: request.user,
        },
      };
    },
  );
};
