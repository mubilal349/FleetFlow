import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createVehicleRequestSchema,
  vehicleRequestIdParamsSchema,
} from "../schemas/vehicleRequestSchema.js";

import {
  cancelVehicleRequestService,
  createVehicleRequestService,
  getCustomerRequestService,
  getCustomerRequestsService,
} from "../services/vehicleRequestService.js";

export async function createVehicleRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = createVehicleRequestSchema.parse(request.body);

    const authorization = request.headers.authorization;

    if (!authorization) {
      return reply.status(401).send({
        success: false,
        message: "Authentication required.",
      });
    }

    const vehicleRequest = await createVehicleRequestService(
      {
        organizationId: request.user.organizationId,
        customerId: request.user.userId,
        ...body,
      },
      authorization.substring(7).trim(),
    );

    return reply.status(201).send({
      success: true,
      message: "Vehicle request submitted successfully.",
      data: vehicleRequest,
    });
  } catch (error: any) {
    request.log.error(
      {
        error,
      },
      "Failed to create vehicle request",
    );

    return reply.status(400).send({
      success: false,
      message:
        error?.issues?.[0]?.message ||
        error?.message ||
        "Failed to create vehicle request.",
    });
  }
}

export async function getCustomerRequestsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
    };

    const page = Math.max(1, Number(query.page || 1));

    const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));

    const result = await getCustomerRequestsService(
      request.user.organizationId,
      request.user.userId,
      page,
      limit,
    );

    return reply.send({
      success: true,
      message: "Vehicle requests retrieved successfully.",
      data: result,
    });
  } catch (error) {
    request.log.error(
      {
        error,
      },
      "Failed to retrieve customer requests",
    );

    return reply.status(500).send({
      success: false,
      message: "Failed to retrieve vehicle requests.",
    });
  }
}

export async function getCustomerRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = vehicleRequestIdParamsSchema.parse(request.params);

    const vehicleRequest = await getCustomerRequestService(
      id,
      request.user.organizationId,
      request.user.userId,
    );

    return reply.send({
      success: true,
      message: "Vehicle request retrieved successfully.",
      data: vehicleRequest,
    });
  } catch (error: any) {
    return reply.status(404).send({
      success: false,
      message: error?.message || "Vehicle request not found.",
    });
  }
}

export async function cancelVehicleRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = vehicleRequestIdParamsSchema.parse(request.params);

    const vehicleRequest = await cancelVehicleRequestService(
      id,
      request.user.organizationId,
      request.user.userId,
    );

    return reply.send({
      success: true,
      message: "Vehicle request cancelled successfully.",
      data: vehicleRequest,
    });
  } catch (error: any) {
    const message = error?.message || "Failed to cancel vehicle request.";

    const status = message === "Vehicle request not found." ? 404 : 400;

    return reply.status(status).send({
      success: false,
      message,
    });
  }
}
