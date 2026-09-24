import type { FastifyReply, FastifyRequest } from "fastify";

import { ZodError } from "zod";

import {
  createVehicleRequestSchema,
  listVehicleRequestsQuerySchema,
  rejectVehicleRequestSchema,
  vehicleRequestIdParamsSchema,
} from "../schemas/vehicleRequestSchema.js";

import {
  approveVehicleRequestService,
  cancelVehicleRequestService,
  createVehicleRequestService,
  getCustomerRequestService,
  getCustomerRequestsService,
  getOrganizationRequestsService,
  rejectVehicleRequestService,
} from "../services/vehicleRequestService.js";

function handleControllerError(reply: FastifyReply, error: unknown) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: "Validation failed.",
      errors: error.issues,
    });
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  return reply.status(400).send({
    success: false,
    message,
  });
}

/**
 * Customer creates a vehicle request.
 */
export async function createVehicleRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = createVehicleRequestSchema.parse(request.body);

    const token = request.headers.authorization?.replace("Bearer ", "") || "";

    const result = await createVehicleRequestService(
      {
        organizationId: request.user.organizationId,

        customerId: request.user.userId,

        vehicleId: body.vehicleId,

        purpose: body.purpose,

        pickupLocation: body.pickupLocation,

        destination: body.destination,

        startDate: body.startDate,

        endDate: body.endDate,

        notes: body.notes,
      },
      token,
    );

    return reply.status(201).send({
      success: true,
      message: "Vehicle request submitted successfully.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

/**
 * Customer gets their own requests.
 */
export async function getCustomerRequestsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = listVehicleRequestsQuerySchema.parse(request.query);

    const result = await getCustomerRequestsService(
      request.user.organizationId,
      request.user.userId,
      query.page,
      query.limit,
    );

    return reply.send({
      success: true,
      message: "Vehicle requests retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

/**
 * Admin/Manager gets all requests
 * belonging to their organization.
 */
export async function getOrganizationRequestsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = listVehicleRequestsQuerySchema.parse(request.query);

    const result = await getOrganizationRequestsService(
      request.user.organizationId,
      query.page,
      query.limit,
      query.status,
    );

    return reply.send({
      success: true,
      message: "Vehicle requests retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

/**
 * Customer gets one of their own requests.
 */
export async function getCustomerRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = vehicleRequestIdParamsSchema.parse(request.params);

    const result = await getCustomerRequestService(
      params.id,
      request.user.organizationId,
      request.user.userId,
    );

    return reply.send({
      success: true,
      message: "Vehicle request retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

/**
 * Customer cancels a pending request.
 */
export async function cancelVehicleRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = vehicleRequestIdParamsSchema.parse(request.params);

    const result = await cancelVehicleRequestService(
      params.id,
      request.user.organizationId,
      request.user.userId,
    );

    return reply.send({
      success: true,
      message: "Vehicle request cancelled successfully.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

/**
 * Admin/Manager approves a pending request.
 */
export async function approveVehicleRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = vehicleRequestIdParamsSchema.parse(request.params);

    const result = await approveVehicleRequestService(
      params.id,
      request.user.organizationId,
      request.user.userId,
    );

    return reply.send({
      success: true,
      message: "Vehicle request approved successfully.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(reply, error);
  }
}

/**
 * Admin/Manager rejects a pending request.
 */
export async function rejectVehicleRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = vehicleRequestIdParamsSchema.parse(request.params);

    const body = rejectVehicleRequestSchema.parse(request.body);

    const result = await rejectVehicleRequestService(
      params.id,
      request.user.organizationId,
      request.user.userId,
      body.rejectionReason,
    );

    return reply.send({
      success: true,
      message: "Vehicle request rejected successfully.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(reply, error);
  }
}
