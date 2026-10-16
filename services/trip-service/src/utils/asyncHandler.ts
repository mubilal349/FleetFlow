import type { FastifyReply, FastifyRequest } from "fastify";

export type AsyncHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<unknown>;

export function asyncHandler(handler: AsyncHandler): AsyncHandler {
  return async (request, reply) => {
    return handler(request, reply);
  };
}
