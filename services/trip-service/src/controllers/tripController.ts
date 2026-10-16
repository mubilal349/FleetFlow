import type { FastifyReply, FastifyRequest } from "fastify";
import {
  cancelTrip,
  completeTrip,
  createTrip,
  deleteTrip,
  getTripById,
  getTrips,
  startTrip,
  updateTrip,
  validateTripStatus,
} from "../services/tripService.js";
import { getOrganizationId, getUserId } from "../types/auth.js";
import type {
  CreateTripInput,
  TripListQuery,
  UpdateTripInput,
} from "../types/trip.js";
import { HttpError } from "../utils/httpError.js";

type IdParams = { id: string };
type DriverParams = { driverId: string };
type VehicleParams = { vehicleId: string };

function getBody(request: FastifyRequest): Record<string, unknown> {
  const body: unknown = request.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "A JSON request body is required.");
  }

  return body as Record<string, unknown>;
}

function getId(request: FastifyRequest): string {
  return (request.params as IdParams).id;
}

function getPageQuery(request: FastifyRequest): TripListQuery {
  const query = request.query as Record<string, unknown>;

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (!Number.isInteger(page) || page < 1) {
    throw new HttpError(400, "Page must be a positive integer.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, "Limit must be between 1 and 100.");
  }

  let status: TripListQuery["status"];

  if (query.status !== undefined && query.status !== "") {
    if (typeof query.status !== "string") {
      throw new HttpError(400, "Invalid status filter.");
    }

    status = validateTripStatus(query.status);
  }

  return {
    page,
    limit,
    status,
    search: typeof query.search === "string" ? query.search : undefined,
    driverId: typeof query.driverId === "string" ? query.driverId : undefined,
    vehicleId:
      typeof query.vehicleId === "string" ? query.vehicleId : undefined,
  };
}

async function handle(
  request: FastifyRequest,
  reply: FastifyReply,
  operation: () => Promise<unknown>,
  successStatus = 200,
): Promise<void> {
  try {
    const data = await operation();

    await reply.code(successStatus).send({
      success: true,
      message: "Request completed successfully.",
      data,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      await reply.code(error.statusCode).send({
        success: false,
        message: error.message,
      });
      return;
    }

    request.log.error(error);

    await reply.code(500).send({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

export async function createTripHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(
    request,
    reply,
    async () =>
      createTrip(
        getOrganizationId(request.user),
        getUserId(request.user),
        getBody(request) as unknown as CreateTripInput,
      ),
    201,
  );
}

export async function listTripsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () => {
    const query = getPageQuery(request);

    const driverScope =
      request.user.role === "driver" ? getUserId(request.user) : undefined;

    return getTrips(getOrganizationId(request.user), query, driverScope);
  });
}

export async function getTripHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () => {
    const driverScope =
      request.user.role === "driver" ? getUserId(request.user) : undefined;

    return getTripById(
      getOrganizationId(request.user),
      getId(request),
      driverScope,
    );
  });
}

export async function updateTripHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () =>
    updateTrip(
      getOrganizationId(request.user),
      getId(request),
      getBody(request) as unknown as UpdateTripInput,
    ),
  );
}

export async function startTripHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () => {
    const body = getBody(request);

    return startTrip(
      getOrganizationId(request.user),
      getId(request),
      body.startMileage,
    );
  });
}

export async function completeTripHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () => {
    const body = getBody(request);

    return completeTrip(
      getOrganizationId(request.user),
      getId(request),
      body.endMileage,
    );
  });
}

export async function cancelTripHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () => {
    const body = getBody(request);

    return cancelTrip(
      getOrganizationId(request.user),
      getId(request),
      typeof body.reason === "string" ? body.reason : undefined,
    );
  });
}

export async function deleteTripHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, async () => {
    await deleteTrip(getOrganizationId(request.user), getId(request));

    return { deleted: true };
  });
}

export async function tripsByDriverHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () => {
    const { driverId } = request.params as DriverParams;

    if (
      request.user.role === "driver" &&
      getUserId(request.user) !== driverId
    ) {
      throw new HttpError(403, "You can only view your own trips.");
    }

    return getTrips(
      getOrganizationId(request.user),
      { ...getPageQuery(request), driverId },
      request.user.role === "driver" ? getUserId(request.user) : undefined,
    );
  });
}

export async function tripsByVehicleHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return handle(request, reply, () => {
    const { vehicleId } = request.params as VehicleParams;

    return getTrips(getOrganizationId(request.user), {
      ...getPageQuery(request),
      vehicleId,
    });
  });
}
