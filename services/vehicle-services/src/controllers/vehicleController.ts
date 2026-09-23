import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
  updateVehicleStatusSchema,
  vehicleIdParamsSchema,
} from "../schemas/vehicleSchema.js";

import {
  createVehicleService,
  deactivateVehicleService,
  getVehicleService,
  getVehiclesService,
  updateVehicleService,
  VehicleServiceError,
} from "../services/vehicleService.js";

function handleError(reply: FastifyReply, error: unknown) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: "Validation failed.",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof VehicleServiceError) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
      code: error.code,
    });
  }

  console.error("Vehicle controller error:", error);

  return reply.status(500).send({
    success: false,
    message: "Internal server error.",
  });
}

export async function createVehicleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = createVehicleSchema.parse(request.body);

    const vehicle = await createVehicleService(body);

    return reply.status(201).send({
      success: true,
      message: "Vehicle created successfully.",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function getVehiclesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = listVehiclesQuerySchema.parse(request.query);

    const result = await getVehiclesService(query);

    return reply.status(200).send({
      success: true,
      message: "Vehicles retrieved successfully.",
      data: result,
    });
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function getVehicleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = vehicleIdParamsSchema.parse(request.params);

    const query = listVehiclesQuerySchema
      .pick({
        organizationId: true,
      })
      .parse(request.query);

    const vehicle = await getVehicleService(id, query.organizationId);

    return reply.status(200).send({
      success: true,
      message: "Vehicle retrieved successfully.",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function updateVehicleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = vehicleIdParamsSchema.parse(request.params);

    const query = listVehiclesQuerySchema
      .pick({
        organizationId: true,
      })
      .parse(request.query);

    const updates = updateVehicleSchema.parse(request.body);

    const vehicle = await updateVehicleService(
      id,
      query.organizationId,
      updates,
    );

    return reply.status(200).send({
      success: true,
      message: "Vehicle updated successfully.",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function updateVehicleStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = vehicleIdParamsSchema.parse(request.params);

    const query = listVehiclesQuerySchema
      .pick({
        organizationId: true,
      })
      .parse(request.query);

    const { status } = updateVehicleStatusSchema.parse(request.body);

    const vehicle = await updateVehicleService(id, query.organizationId, {
      $set: {
        status,
      },
    });

    return reply.status(200).send({
      success: true,
      message: "Vehicle status updated successfully.",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function deleteVehicleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = vehicleIdParamsSchema.parse(request.params);

    const query = listVehiclesQuerySchema
      .pick({
        organizationId: true,
      })
      .parse(request.query);

    const vehicle = await deactivateVehicleService(id, query.organizationId);

    return reply.status(200).send({
      success: true,
      message: "Vehicle deactivated successfully.",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    return handleError(reply, error);
  }
}
