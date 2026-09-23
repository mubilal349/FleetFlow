import { UserRole } from "../models/User.js";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      userId: string;
      email: string;
      role: UserRole;
      organizationId: string;
    };
  }
}
