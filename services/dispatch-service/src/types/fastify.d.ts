import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      role: string;
      organizationId?: string;
      orgId?: string;
    };

    user: {
      id: string;
      role: string;
      organizationId?: string;
      orgId?: string;
    };
  }
}

export {};
