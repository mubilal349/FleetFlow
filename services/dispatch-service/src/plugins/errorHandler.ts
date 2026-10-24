import type { FastifyError, FastifyInstance } from "fastify";
import { ZodError } from "zod";

import { DispatchServiceError } from "../services/dispatchService.js";
import { ServiceClientError } from "../services/httpClient.js";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | Error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        success: false,
        message: "Request validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (error instanceof DispatchServiceError) {
      request.log.error(
        {
          err: error,
          statusCode: error.statusCode,
        },
        "Dispatch service operation failed",
      );

      return reply.code(error.statusCode).send({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof ServiceClientError) {
      request.log.error(
        {
          err: error,
          service: error.serviceName,
          statusCode: error.statusCode,
          downstreamMessage: error.message,
        },
        "Downstream service request failed",
      );

      const statusCode = error.statusCode >= 500 ? 502 : error.statusCode;

      // During development, expose the downstream error to help
      // identify incorrect URLs, missing records, and authorization issues.
      const isDevelopment = process.env.NODE_ENV !== "production";

      return reply.code(statusCode).send({
        success: false,
        message: isDevelopment
          ? error.message
          : "A dependent service request failed",
        service: error.serviceName,
        ...(isDevelopment ? { downstreamStatusCode: error.statusCode } : {}),
      });
    }

    request.log.error({ err: error }, "Unhandled request error");

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  });
}
