import { UserRole } from "../models/User.js";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: UserRole;
      organizationId: string;
    };
  }
}
