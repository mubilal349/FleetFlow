import type { FastifyRequest } from "fastify";

import { assignmentClient } from "./assignmentClient.js";
import { driverClient } from "./driverClient.js";
import { tripClient } from "./tripClient.js";
import { vehicleClient } from "./vehicleClient.js";
import { ServiceClientError } from "./httpClient.js";

import { dispatchRepository } from "../repositories/dispatchRepository.js";

import type {
  CreateDispatchInput,
  Dispatch,
  DispatchFilters,
  DispatchStatus,
  UpdateDispatchInput,
} from "../types/dispatch.js";

import type { DispatchDocument } from "../models/dispatchModel.js";

export class DispatchServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "DispatchServiceError";
  }
}

interface Actor {
  id: string;
  role: string;
  organizationId: string;
}

interface DispatchContext {
  actor: Actor;
  token: string;
}

function toDispatch(document: DispatchDocument): Dispatch {
  const { _id, ...rest } = document;

  return {
    ...rest,
    id: _id.toString(),
  } as Dispatch;
}

function assertRole(actor: Actor): void {
  if (!["admin", "manager"].includes(actor.role)) {
    throw new DispatchServiceError(
      "You are not authorized to manage dispatches",
      403,
    );
  }
}

function assertSameOrganization(
  resource: { organizationId?: string; organization?: string },
  organizationId: string,
  resourceName: string,
): void {
  const resourceOrganization = resource.organizationId ?? resource.organization;

  if (resourceOrganization && resourceOrganization !== organizationId) {
    throw new DispatchServiceError(
      `${resourceName} belongs to another organization`,
      403,
    );
  }
}

function assertResourceAvailable(
  resource: { status?: string },
  resourceName: string,
): void {
  if (typeof resource.status !== "string" || !resource.status.trim()) {
    throw new DispatchServiceError(
      `Could not verify ${resourceName} availability. The service response is missing its status field.`,
      502,
    );
  }

  if (resource.status.trim().toLowerCase() !== "available") {
    throw new DispatchServiceError(
      `${resourceName} is not available (current status: ${resource.status})`,
      409,
    );
  }
}

function getBearerToken(request: FastifyRequest): string {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new DispatchServiceError("Authentication token is required", 401);
  }

  return authorization.slice(7);
}

function getActor(request: FastifyRequest): Actor {
  const user = request.user;
  const organizationId = user.organizationId ?? user.orgId;

  if (!user.id || !organizationId) {
    throw new DispatchServiceError(
      "Authenticated user or organization context is missing",
      401,
    );
  }

  return {
    id: user.id,
    role: user.role,
    organizationId,
  };
}

function getContext(request: FastifyRequest): DispatchContext {
  return {
    actor: getActor(request),
    token: getBearerToken(request),
  };
}

function validateTransition(
  current: DispatchStatus,
  next: DispatchStatus,
): void {
  const transitions: Record<DispatchStatus, DispatchStatus[]> = {
    pending: ["assigned", "cancelled"],
    assigned: ["dispatched", "cancelled"],
    dispatched: ["in_progress", "cancelled"],
    in_progress: ["completed"],
    completed: [],
    cancelled: [],
  };

  if (!transitions[current].includes(next)) {
    throw new DispatchServiceError(
      `Cannot change dispatch status from ${current} to ${next}`,
      409,
    );
  }
}

/**
 * Fetch a vehicle and driver while preserving useful service errors.
 * HTTP/network errors are translated into dispatch-specific errors.
 */
async function getAvailableResources(
  vehicleId: string,
  driverId: string,
  token: string,
): Promise<{
  vehicle: Awaited<ReturnType<typeof vehicleClient.getVehicle>>;
  driver: Awaited<ReturnType<typeof driverClient.getDriver>>;
}> {
  try {
    const [vehicle, driver] = await Promise.all([
      vehicleClient.getVehicle(vehicleId, token),
      driverClient.getDriver(driverId, token),
    ]);

    return { vehicle, driver };
  } catch (error) {
    if (error instanceof DispatchServiceError) {
      throw error;
    }

    if (error instanceof ServiceClientError) {
      throw new DispatchServiceError(
        `${error.serviceName} verification failed: ${error.message}`,
        error.statusCode >= 400 && error.statusCode <= 599
          ? error.statusCode
          : 502,
      );
    }

    throw new DispatchServiceError(
      error instanceof Error
        ? `Could not verify vehicle and driver availability: ${error.message}`
        : "Could not verify vehicle and driver availability",
      502,
    );
  }
}

export const dispatchService = {
  async create(
    input: CreateDispatchInput,
    context: DispatchContext,
  ): Promise<Dispatch> {
    const { actor, token } = context;

    assertRole(actor);

    const trip = await tripClient.getTrip(input.tripId, token);

    assertSameOrganization(trip, actor.organizationId, "Trip");

    if (
      trip.status &&
      ["completed", "cancelled"].includes(trip.status.toLowerCase())
    ) {
      throw new DispatchServiceError(
        "A completed or cancelled trip cannot be dispatched",
        409,
      );
    }

    const existing = await dispatchRepository.findByTripId(
      input.tripId,
      actor.organizationId,
    );

    if (existing) {
      throw new DispatchServiceError(
        "A dispatch already exists for this trip",
        409,
      );
    }

    let status: DispatchStatus = "pending";
    let assignmentId: string | null = null;
    const vehicleId: string | null = input.vehicleId ?? null;
    const driverId: string | null = input.driverId ?? null;

    if (vehicleId || driverId) {
      if (!vehicleId || !driverId) {
        throw new DispatchServiceError(
          "Provide both vehicleId and driverId, or neither",
        );
      }

      const { vehicle, driver } = await getAvailableResources(
        vehicleId,
        driverId,
        token,
      );

      assertSameOrganization(vehicle, actor.organizationId, "Vehicle");
      assertSameOrganization(driver, actor.organizationId, "Driver");

      assertResourceAvailable(vehicle, "Vehicle");
      assertResourceAvailable(driver, "Driver");

      function getStartingMileage(vehicle: {
        currentMileage?: number;
      }): number {
        const mileage = vehicle.currentMileage;

        if (
          typeof mileage !== "number" ||
          !Number.isFinite(mileage) ||
          mileage < 0
        ) {
          throw new DispatchServiceError(
            "Vehicle current mileage is missing or invalid. Update the vehicle record before creating an assignment.",
            400,
          );
        }

        return mileage;
      }

      const assignment = await assignmentClient.create(
        {
          vehicleId,
          driverId,
          startingMileage: getStartingMileage(vehicle),
          notes: input.notes,
          expectedReturnDate: input.scheduledAt,
        },
        token,
      );

      if (typeof assignment !== "object" || assignment === null) {
        throw new DispatchServiceError(
          "Assignment Service returned an invalid response",
          502,
        );
      }

      const assignmentPayload =
        "data" in assignment ? assignment.data : assignment;

      if (typeof assignmentPayload !== "object" || assignmentPayload === null) {
        throw new DispatchServiceError("Assignment ID was not returned", 502);
      }

      const assignmentRecord = assignmentPayload as {
        id?: string;
        _id?: string;
        assignment?: { id?: string; _id?: string };
      };

      assignmentId =
        assignmentRecord.id ??
        assignmentRecord._id ??
        assignmentRecord.assignment?.id ??
        assignmentRecord.assignment?._id ??
        null;

      if (!assignmentId) {
        throw new DispatchServiceError(
          "Assignment Service did not return an assignment ID",
          502,
        );
      }

      status = "assigned";
    }

    const now = new Date();

    const document = await dispatchRepository.create({
      organizationId: actor.organizationId,
      tripId: input.tripId,
      vehicleId,
      driverId,
      assignmentId,
      status,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      dispatchedAt: null,
      startedAt: null,
      completedAt: null,
      notes: input.notes ?? null,
      cancellationReason: null,
      createdBy: actor.id,
      createdAt: now,
      updatedAt: now,
    });

    return toDispatch(document);
  },

  async list(filters: DispatchFilters, context: DispatchContext) {
    const { actor } = context;

    const result = await dispatchRepository.list(filters, actor.organizationId);

    return {
      data: result.data.map(toDispatch),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / filters.limit),
      },
    };
  },

  async getById(id: string, context: DispatchContext): Promise<Dispatch> {
    const document = await dispatchRepository.findById(
      id,
      context.actor.organizationId,
    );

    if (!document) {
      throw new DispatchServiceError("Dispatch not found", 404);
    }

    return toDispatch(document);
  },

  async update(
    id: string,
    input: UpdateDispatchInput,
    context: DispatchContext,
  ): Promise<Dispatch> {
    const { actor, token } = context;

    assertRole(actor);

    const current = await this.getById(id, context);

    if (!["pending", "assigned"].includes(current.status)) {
      throw new DispatchServiceError(
        "Only pending or assigned dispatches can be edited",
        409,
      );
    }

    const changes: Partial<DispatchDocument> = {};

    if (input.notes !== undefined) {
      changes.notes = input.notes;
    }

    if (input.scheduledAt !== undefined) {
      changes.scheduledAt = input.scheduledAt
        ? new Date(input.scheduledAt)
        : null;
    }

    const vehicleId = input.vehicleId ?? current.vehicleId;
    const driverId = input.driverId ?? current.driverId;

    if (input.vehicleId !== undefined || input.driverId !== undefined) {
      if (!vehicleId || !driverId) {
        throw new DispatchServiceError(
          "Both vehicle and driver are required when changing resources",
        );
      }

      const { vehicle, driver } = await getAvailableResources(
        vehicleId,
        driverId,
        token,
      );

      assertSameOrganization(vehicle, actor.organizationId, "Vehicle");
      assertSameOrganization(driver, actor.organizationId, "Driver");

      assertResourceAvailable(vehicle, "Vehicle");
      assertResourceAvailable(driver, "Driver");

      throw new DispatchServiceError(
        "Resource changes must be implemented through a coordinated reassignment workflow",
        501,
      );
    }

    const updated = await dispatchRepository.update(
      id,
      actor.organizationId,
      changes,
    );

    if (!updated) {
      throw new DispatchServiceError("Dispatch not found", 404);
    }

    return toDispatch(updated);
  },

  async assign(
    id: string,
    vehicleId: string,
    driverId: string,
    context: DispatchContext,
  ): Promise<Dispatch> {
    const { actor, token } = context;

    assertRole(actor);

    const current = await this.getById(id, context);

    if (current.status !== "pending") {
      throw new DispatchServiceError(
        "Only pending dispatches can be assigned",
        409,
      );
    }

    const { vehicle, driver } = await getAvailableResources(
      vehicleId,
      driverId,
      token,
    );

    assertSameOrganization(vehicle, actor.organizationId, "Vehicle");
    assertSameOrganization(driver, actor.organizationId, "Driver");

    assertResourceAvailable(vehicle, "Vehicle");
    assertResourceAvailable(driver, "Driver");

    const startingMileage = vehicle.currentMileage;

    if (
      typeof startingMileage !== "number" ||
      !Number.isFinite(startingMileage) ||
      startingMileage < 0
    ) {
      throw new DispatchServiceError(
        "Vehicle current mileage is missing or invalid. Please update the vehicle record.",
        400,
      );
    }

    const result = await assignmentClient.create(
      {
        vehicleId,
        driverId,
        startingMileage,
        notes: current.notes ?? undefined,
      },
      token,
    );
    const payload =
      typeof result === "object" && result !== null && "data" in result
        ? result.data
        : result;

    if (typeof payload !== "object" || payload === null) {
      throw new DispatchServiceError(
        "Assignment Service returned an invalid response",
        502,
      );
    }

    const record = payload as { id?: string; _id?: string };
    const assignmentId = record.id ?? record._id;

    if (!assignmentId) {
      throw new DispatchServiceError("Assignment ID was not returned", 502);
    }

    const updated = await dispatchRepository.update(id, actor.organizationId, {
      vehicleId,
      driverId,
      assignmentId,
      status: "assigned",
    });

    if (!updated) {
      throw new DispatchServiceError(
        "Assignment was created, but dispatch could not be updated; reconciliation is required",
        502,
      );
    }

    return toDispatch(updated);
  },

  async transition(
    id: string,
    nextStatus: DispatchStatus,
    context: DispatchContext,
    reason?: string,
  ): Promise<Dispatch> {
    const { actor } = context;

    assertRole(actor);

    const current = await this.getById(id, context);

    validateTransition(current.status, nextStatus);

    if (
      ["dispatched", "in_progress", "completed"].includes(nextStatus) &&
      (!current.vehicleId || !current.driverId || !current.assignmentId)
    ) {
      throw new DispatchServiceError(
        "A vehicle, driver, and assignment are required before dispatch execution",
        409,
      );
    }

    const now = new Date();
    const changes: Partial<DispatchDocument> = {};

    if (nextStatus === "dispatched") changes.dispatchedAt = now;
    if (nextStatus === "in_progress") changes.startedAt = now;
    if (nextStatus === "completed") changes.completedAt = now;

    if (nextStatus === "cancelled") {
      changes.cancellationReason = reason ?? null;
    }

    const updated = await dispatchRepository.updateStatus(
      id,
      actor.organizationId,
      nextStatus,
      changes,
    );

    if (!updated) {
      throw new DispatchServiceError("Dispatch not found", 404);
    }

    return toDispatch(updated);
  },

  async cancel(
    id: string,
    reason: string,
    context: DispatchContext,
  ): Promise<Dispatch> {
    return this.transition(id, "cancelled", context, reason);
  },
};

export { getContext };
