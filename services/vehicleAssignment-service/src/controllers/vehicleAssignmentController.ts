import type { FastifyReply, FastifyRequest } from "fastify";

import { ZodError } from "zod";

import VehicleAssignment from "../models/vehicleAssignmentModel.js";

import {
  getAuthenticatedUser,
  getBearerToken,
} from "../middleware/authMiddleware.js";

import {
  createVehicleAssignmentSchema,
  completeVehicleAssignmentSchema,
  cancelVehicleAssignmentSchema,
  vehicleAssignmentIdParamsSchema,
  vehicleIdParamsSchema,
  driverIdParamsSchema,
  listVehicleAssignmentsQuerySchema,
} from "../schemas/vehicleAssignmentSchema.js";

import {
  getVehicleFromVehicleService,
  updateVehicleStatus,
  VehicleServiceClientError,
} from "../services/vehicleServiceClient.js";

/**
 * Centralized controller error handling.
 */
function handleError(reply: FastifyReply, error: unknown) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      message: "Validation failed.",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof VehicleServiceClientError) {
    return reply.status(error.statusCode).send({
      success: false,
      message: error.message,
      code: error.code,
    });
  }

  console.error("Vehicle Assignment controller error:", error);

  return reply.status(500).send({
    success: false,
    message: "Internal server error.",
  });
}

/**
 * Create a new vehicle assignment.
 *
 * Flow:
 * 1. Authenticate user.
 * 2. Validate request.
 * 3. Get vehicle from Vehicle Service.
 * 4. Verify vehicle belongs to the organization.
 * 5. Verify vehicle is available.
 * 6. Verify vehicle doesn't already have an active assignment.
 * 7. Verify driver doesn't already have an active assignment.
 * 8. Change vehicle status to assigned.
 * 9. Create assignment.
 * 10. Roll vehicle back to available if assignment creation fails.
 */
export async function createVehicleAssignmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const token = getBearerToken(request);

    const body = createVehicleAssignmentSchema.parse(request.body);

    /**
     * Get the vehicle from Vehicle Service.
     *
     * Assignment Service does not access
     * the Vehicle model directly.
     */
    const vehicle = await getVehicleFromVehicleService(body.vehicleId, token);

    if (!vehicle) {
      return reply.status(404).send({
        success: false,
        message: "Vehicle not found.",
        code: "VEHICLE_NOT_FOUND",
      });
    }

    /**
     * Organization isolation.
     *
     * This protects against assigning a vehicle
     * belonging to another organization.
     */
    if (
      vehicle.organizationId &&
      vehicle.organizationId !== user.organizationId
    ) {
      return reply.status(404).send({
        success: false,
        message: "Vehicle not found.",
        code: "VEHICLE_NOT_FOUND",
      });
    }

    /**
     * A vehicle must be available before
     * it can be assigned.
     */
    if (vehicle.status !== "available") {
      return reply.status(409).send({
        success: false,
        message: "This vehicle is not available for assignment.",
        code: "VEHICLE_NOT_AVAILABLE",
      });
    }

    /**
     * Check whether the vehicle already
     * has an active assignment.
     */
    const existingVehicleAssignment = await VehicleAssignment.findOne({
      organizationId: user.organizationId,
      vehicleId: body.vehicleId,
      status: "active",
    });

    if (existingVehicleAssignment) {
      return reply.status(409).send({
        success: false,
        message: "This vehicle already has an active assignment.",
        code: "VEHICLE_ALREADY_ASSIGNED",
      });
    }

    /**
     * Check whether the driver already
     * has an active assignment.
     */
    const existingDriverAssignment = await VehicleAssignment.findOne({
      organizationId: user.organizationId,
      driverId: body.driverId,
      status: "active",
    });

    if (existingDriverAssignment) {
      return reply.status(409).send({
        success: false,
        message: "This driver already has an active vehicle assignment.",
        code: "DRIVER_ALREADY_ASSIGNED",
      });
    }

    /**
     * Update vehicle status first.
     *
     * This prevents creating an active assignment
     * while the vehicle still appears available.
     */
    await updateVehicleStatus(body.vehicleId, "assigned", token);

    try {
      /**
       * Create the assignment after the vehicle
       * has successfully changed to assigned.
       */
      const assignment = await VehicleAssignment.create({
        organizationId: user.organizationId,

        vehicleId: body.vehicleId,

        driverId: body.driverId,

        assignedBy: user.id,

        assignedAt: new Date(),

        expectedReturnDate: body.expectedReturnDate
          ? new Date(body.expectedReturnDate)
          : null,

        status: "active",

        startingMileage: body.startingMileage,

        notes: body.notes,
      });

      return reply.status(201).send({
        success: true,
        message: "Vehicle assigned successfully.",
        data: {
          assignment,
        },
      });
    } catch (assignmentError) {
      /**
       * Assignment creation failed after the
       * vehicle was marked assigned.
       *
       * Attempt to restore the vehicle state.
       */
      try {
        await updateVehicleStatus(body.vehicleId, "available", token);
      } catch (rollbackError) {
        request.log.error(
          {
            assignmentError,
            rollbackError,
          },
          "Assignment creation failed and vehicle rollback also failed.",
        );
      }

      throw assignmentError;
    }
  } catch (error) {
    request.log.error({ error }, "Failed to create vehicle assignment");

    return handleError(reply, error);
  }
}

/**
 * Get vehicle assignments.
 *
 * Supports:
 * - status
 * - vehicleId
 * - driverId
 * - pagination
 */
export async function getVehicleAssignmentsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const query = listVehicleAssignmentsQuerySchema.parse(request.query);

    const filter: Record<string, unknown> = {
      organizationId: user.organizationId,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.vehicleId) {
      filter.vehicleId = query.vehicleId;
    }

    if (query.driverId) {
      filter.driverId = query.driverId;
    }

    const skip = (query.page - 1) * query.limit;

    const [assignments, total] = await Promise.all([
      VehicleAssignment.find(filter)
        .sort({
          assignedAt: -1,
        })
        .skip(skip)
        .limit(query.limit)
        .lean(),

      VehicleAssignment.countDocuments(filter),
    ]);

    return reply.status(200).send({
      success: true,
      message: "Vehicle assignments retrieved successfully.",
      data: assignments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    request.log.error({ error }, "Failed to get vehicle assignments");

    return handleError(reply, error);
  }
}

/**
 * Get a single vehicle assignment.
 */
export async function getVehicleAssignmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const params = vehicleAssignmentIdParamsSchema.parse(request.params);

    const assignment = await VehicleAssignment.findOne({
      _id: params.id,
      organizationId: user.organizationId,
    }).lean();

    if (!assignment) {
      return reply.status(404).send({
        success: false,
        message: "Vehicle assignment not found.",
        code: "ASSIGNMENT_NOT_FOUND",
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Vehicle assignment retrieved successfully.",
      data: assignment,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to get vehicle assignment");

    return handleError(reply, error);
  }
}

/**
 * Complete an active vehicle assignment.
 *
 * Flow:
 * 1. Find assignment.
 * 2. Verify active status.
 * 3. Validate ending mileage.
 * 4. Change vehicle back to available.
 * 5. Complete assignment.
 */
export async function completeVehicleAssignmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const token = getBearerToken(request);

    const params = vehicleAssignmentIdParamsSchema.parse(request.params);

    const body = completeVehicleAssignmentSchema.parse(request.body);

    const assignment = await VehicleAssignment.findOne({
      _id: params.id,
      organizationId: user.organizationId,
    });

    if (!assignment) {
      return reply.status(404).send({
        success: false,
        message: "Vehicle assignment not found.",
        code: "ASSIGNMENT_NOT_FOUND",
      });
    }

    if (assignment.status !== "active") {
      return reply.status(409).send({
        success: false,
        message: "Only active assignments can be completed.",
        code: "ASSIGNMENT_NOT_ACTIVE",
      });
    }

    /**
     * Ending mileage cannot be lower
     * than starting mileage.
     */
    if (body.endingMileage < assignment.startingMileage) {
      return reply.status(400).send({
        success: false,
        message: "Ending mileage cannot be less than starting mileage.",
        code: "INVALID_ENDING_MILEAGE",
      });
    }

    /**
     * Make the vehicle available again.
     *
     * If this fails, don't mark the assignment
     * as completed because the two services
     * would become inconsistent.
     */
    await updateVehicleStatus(assignment.vehicleId, "available", token);

    try {
      assignment.status = "completed";

      assignment.returnedAt = new Date();

      assignment.endingMileage = body.endingMileage;

      if (body.notes !== undefined) {
        assignment.notes = body.notes;
      }

      await assignment.save();

      return reply.status(200).send({
        success: true,
        message: "Vehicle assignment completed successfully.",
        data: {
          assignment,
        },
      });
    } catch (assignmentError) {
      /**
       * Assignment update failed after vehicle
       * was returned to available.
       *
       * Attempt to restore vehicle to assigned.
       */
      try {
        await updateVehicleStatus(assignment.vehicleId, "assigned", token);
      } catch (rollbackError) {
        request.log.error(
          {
            assignmentError,
            rollbackError,
          },
          "Assignment completion failed and vehicle rollback also failed.",
        );
      }

      throw assignmentError;
    }
  } catch (error) {
    request.log.error({ error }, "Failed to complete vehicle assignment");

    return handleError(reply, error);
  }
}

/**
 * Cancel an active vehicle assignment.
 *
 * The vehicle becomes available again.
 */
export async function cancelVehicleAssignmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const token = getBearerToken(request);

    const params = vehicleAssignmentIdParamsSchema.parse(request.params);

    const body = cancelVehicleAssignmentSchema.parse(request.body);

    const assignment = await VehicleAssignment.findOne({
      _id: params.id,
      organizationId: user.organizationId,
    });

    if (!assignment) {
      return reply.status(404).send({
        success: false,
        message: "Vehicle assignment not found.",
        code: "ASSIGNMENT_NOT_FOUND",
      });
    }

    if (assignment.status !== "active") {
      return reply.status(409).send({
        success: false,
        message: "Only active assignments can be cancelled.",
        code: "ASSIGNMENT_NOT_ACTIVE",
      });
    }

    /**
     * Return vehicle to available first.
     */
    await updateVehicleStatus(assignment.vehicleId, "available", token);

    try {
      assignment.status = "cancelled";

      if (body.notes !== undefined) {
        assignment.notes = body.notes;
      }

      await assignment.save();

      return reply.status(200).send({
        success: true,
        message: "Vehicle assignment cancelled successfully.",
        data: {
          assignment,
        },
      });
    } catch (assignmentError) {
      /**
       * Assignment cancellation failed after
       * vehicle was made available.
       *
       * Attempt to restore vehicle to assigned.
       */
      try {
        await updateVehicleStatus(assignment.vehicleId, "assigned", token);
      } catch (rollbackError) {
        request.log.error(
          {
            assignmentError,
            rollbackError,
          },
          "Assignment cancellation failed and vehicle rollback also failed.",
        );
      }

      throw assignmentError;
    }
  } catch (error) {
    request.log.error({ error }, "Failed to cancel vehicle assignment");

    return handleError(reply, error);
  }
}

/**
 * Get complete assignment history for a vehicle.
 */
export async function getVehicleAssignmentHistoryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const params = vehicleIdParamsSchema.parse(request.params);

    const assignments = await VehicleAssignment.find({
      organizationId: user.organizationId,
      vehicleId: params.vehicleId,
    })
      .sort({
        assignedAt: -1,
      })
      .lean();

    return reply.status(200).send({
      success: true,
      message: "Vehicle assignment history retrieved successfully.",
      data: assignments,
      count: assignments.length,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to get vehicle assignment history");

    return handleError(reply, error);
  }
}

/**
 * Get complete assignment history for a driver.
 */
export async function getDriverAssignmentHistoryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user = getAuthenticatedUser(request);

    const params = driverIdParamsSchema.parse(request.params);

    const assignments = await VehicleAssignment.find({
      organizationId: user.organizationId,
      driverId: params.driverId,
    })
      .sort({
        assignedAt: -1,
      })
      .lean();

    return reply.status(200).send({
      success: true,
      message: "Driver assignment history retrieved successfully.",
      data: assignments,
      count: assignments.length,
    });
  } catch (error) {
    request.log.error({ error }, "Failed to get driver assignment history");

    return handleError(reply, error);
  }
}
