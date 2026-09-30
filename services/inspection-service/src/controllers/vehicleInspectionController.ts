import type { FastifyReply, FastifyRequest } from "fastify";

import {
  cancelVehicleInspection,
  completeVehicleInspection,
  createVehicleInspection,
  deleteVehicleInspection,
  getVehicleInspectionById,
  getVehicleInspectionHistory,
  getVehicleInspections,
  updateVehicleInspection,
} from "../services/vehicleInspectionService.js";

import {
  createVehicleInspectionSchema,
  updateVehicleInspectionSchema,
} from "../schemas/vehicleInspectionSchema.js";

import {
  type InspectionResult,
  type InspectionStatus,
  type InspectionType,
} from "../models/VehicleInspection.js";

import { getAuthenticatedUser } from "../middleware/authMiddleware.js";

function parsePositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function getOptionalQueryString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed || undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

type ListInspectionsQuery = {
  page?: string;
  limit?: string;
  vehicleId?: string;
  inspectorId?: string;
  status?: string;
  overallResult?: string;
  inspectionType?: string;
};

type InspectionIdParams = {
  id: string;
};

type VehicleHistoryParams = {
  vehicleId: string;
};

type CancelInspectionBody = {
  notes?: string;
};

/**
 * POST /inspections
 */
export async function createVehicleInspectionController(
  request: FastifyRequest<{
    Body: unknown;
  }>,
  reply: FastifyReply,
) {
  try {
    const parsed = createVehicleInspectionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        message: "Invalid inspection data.",
        code: "VALIDATION_ERROR",
        errors: parsed.error.flatten(),
      });
    }

    const user = getAuthenticatedUser(request);

    const inspection = await createVehicleInspection(parsed.data, {
      organizationId: user.organizationId,
    });

    return reply.status(201).send({
      success: true,
      message: "Vehicle inspection created successfully.",
      data: inspection,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to create vehicle inspection");

    return reply.status(400).send({
      success: false,
      message: getErrorMessage(error),
      code: "INSPECTION_CREATION_FAILED",
    });
  }
}

/**
 * GET /inspections
 */
export async function getVehicleInspectionsController(
  request: FastifyRequest<{
    Querystring: ListInspectionsQuery;
  }>,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const page = parsePositiveInteger(request.query.page, 1);

    const limit = Math.min(parsePositiveInteger(request.query.limit, 10), 100);

    const vehicleId = getOptionalQueryString(request.query.vehicleId);

    const inspectorId = getOptionalQueryString(request.query.inspectorId);

    const status = getOptionalQueryString(request.query.status) as
      | InspectionStatus
      | undefined;

    const overallResult = getOptionalQueryString(
      request.query.overallResult,
    ) as InspectionResult | undefined;

    const inspectionType = getOptionalQueryString(
      request.query.inspectionType,
    ) as InspectionType | undefined;

    const result = await getVehicleInspections(
      {
        page,
        limit,
        vehicleId,
        inspectorId,
        status,
        overallResult,
        inspectionType,
      },
      {
        organizationId: user.organizationId,
      },
    );

    const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

    return reply.send({
      success: true,
      message: "Vehicle inspections retrieved successfully.",
      data: result.inspections,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    });
  } catch (error) {
    request.log.error({ error }, "Failed to retrieve vehicle inspections");

    return reply.status(500).send({
      success: false,
      message: getErrorMessage(error),
      code: "INSPECTIONS_RETRIEVAL_FAILED",
    });
  }
}

/**
 * GET /inspections/:id
 */
export async function getVehicleInspectionController(
  request: FastifyRequest<{
    Params: InspectionIdParams;
  }>,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const inspection = await getVehicleInspectionById(request.params.id, {
      organizationId: user.organizationId,
    });

    return reply.send({
      success: true,
      message: "Vehicle inspection retrieved successfully.",
      data: inspection,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    request.log.error({ error }, "Failed to retrieve vehicle inspection");

    const statusCode = message.includes("not found") ? 404 : 400;

    return reply.status(statusCode).send({
      success: false,
      message,
      code: "INSPECTION_RETRIEVAL_FAILED",
    });
  }
}

/**
 * GET /inspections/vehicle/:vehicleId
 */
export async function getVehicleInspectionHistoryController(
  request: FastifyRequest<{
    Params: VehicleHistoryParams;
  }>,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const inspections = await getVehicleInspectionHistory(
      request.params.vehicleId,
      {
        organizationId: user.organizationId,
      },
    );

    return reply.send({
      success: true,
      message: "Vehicle inspection history retrieved successfully.",
      data: inspections,
      count: inspections.length,
    });
  } catch (error) {
    request.log.error(
      { error },
      "Failed to retrieve vehicle inspection history",
    );

    return reply.status(400).send({
      success: false,
      message: getErrorMessage(error),
      code: "INSPECTION_HISTORY_RETRIEVAL_FAILED",
    });
  }
}

/**
 * PATCH /inspections/:id
 */
export async function updateVehicleInspectionController(
  request: FastifyRequest<{
    Params: InspectionIdParams;
    Body: unknown;
  }>,
  reply: FastifyReply,
) {
  try {
    const parsed = updateVehicleInspectionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        message: "Invalid inspection update data.",
        code: "VALIDATION_ERROR",
        errors: parsed.error.flatten(),
      });
    }

    const user = getAuthenticatedUser(request);

    const inspection = await updateVehicleInspection(
      request.params.id,
      parsed.data,
      {
        organizationId: user.organizationId,
      },
    );

    return reply.send({
      success: true,
      message: "Vehicle inspection updated successfully.",
      data: inspection,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    request.log.error({ error }, "Failed to update vehicle inspection");

    const statusCode = message.includes("not found") ? 404 : 400;

    return reply.status(statusCode).send({
      success: false,
      message,
      code: "INSPECTION_UPDATE_FAILED",
    });
  }
}

/**
 * PATCH /inspections/:id/complete
 */
export async function completeVehicleInspectionController(
  request: FastifyRequest<{
    Params: InspectionIdParams;
  }>,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const inspection = await completeVehicleInspection(request.params.id, {
      organizationId: user.organizationId,
    });

    return reply.send({
      success: true,
      message: "Vehicle inspection completed successfully.",
      data: inspection,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    request.log.error({ error }, "Failed to complete vehicle inspection");

    const statusCode = message.includes("not found") ? 404 : 400;

    return reply.status(statusCode).send({
      success: false,
      message,
      code: "INSPECTION_COMPLETION_FAILED",
    });
  }
}

/**
 * PATCH /inspections/:id/cancel
 */
export async function cancelVehicleInspectionController(
  request: FastifyRequest<{
    Params: InspectionIdParams;
    Body: CancelInspectionBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const notes =
      typeof request.body?.notes === "string"
        ? request.body.notes.trim()
        : undefined;

    const inspection = await cancelVehicleInspection(
      request.params.id,
      {
        organizationId: user.organizationId,
      },
      notes,
    );

    return reply.send({
      success: true,
      message: "Vehicle inspection cancelled successfully.",
      data: inspection,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    request.log.error({ error }, "Failed to cancel vehicle inspection");

    const statusCode = message.includes("not found") ? 404 : 400;

    return reply.status(statusCode).send({
      success: false,
      message,
      code: "INSPECTION_CANCELLATION_FAILED",
    });
  }
}

/**
 * DELETE /inspections/:id
 */
export async function deleteVehicleInspectionController(
  request: FastifyRequest<{
    Params: InspectionIdParams;
  }>,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const inspection = await deleteVehicleInspection(request.params.id, {
      organizationId: user.organizationId,
    });

    return reply.send({
      success: true,
      message: "Vehicle inspection deleted successfully.",
      data: inspection,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    request.log.error({ error }, "Failed to delete vehicle inspection");

    const statusCode = message.includes("not found") ? 404 : 400;

    return reply.status(statusCode).send({
      success: false,
      message,
      code: "INSPECTION_DELETION_FAILED",
    });
  }
}
