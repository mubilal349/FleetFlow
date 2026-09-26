import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.error(error);

  if (error.validation) {
    return reply.status(400).send({
      success: false,
      message: "Request validation failed.",
      errors: error.validation,
    });
  }

  return reply.status(500).send({
    success: false,
    message: "Internal server error.",
  });
}
