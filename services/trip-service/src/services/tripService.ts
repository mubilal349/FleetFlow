import { ObjectId, type Filter } from "mongodb";
import { tripCollection } from "../models/tripModel.js";
import type {
  CreateTripInput,
  TripDocument,
  TripListQuery,
  TripStatus,
  UpdateTripInput,
} from "../types/trip.js";
import { TRIP_STATUSES } from "../types/trip.js";
import { HttpError } from "../utils/httpError.js";

function validDate(value: string, field: string): Date {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${field} must be a valid date.`);
  }

  return date;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} is required.`);
  }

  return value.trim();
}

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be text.`);
  }

  return value.trim() || undefined;
}

function validId(value: string, field: string): string {
  const id = requiredText(value, field);

  if (id.length > 100) {
    throw new HttpError(400, `${field} is too long.`);
  }

  return id;
}

function parseMileage(value: unknown, field: string): number {
  const mileage = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(mileage) || mileage < 0) {
    throw new HttpError(400, `${field} must be a non-negative number.`);
  }

  return mileage;
}

function parseObjectId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid trip ID.");
  }

  return new ObjectId(id);
}

function validateArrival(departure: Date, arrival?: Date): void {
  if (arrival && arrival <= departure) {
    throw new HttpError(
      400,
      "Expected arrival must be after scheduled departure.",
    );
  }
}

function validateTripStatus(status: string): TripStatus {
  if (!(TRIP_STATUSES as readonly string[]).includes(status)) {
    throw new HttpError(400, "Invalid trip status filter.");
  }

  return status as TripStatus;
}

export async function createTrip(
  organizationId: string,
  createdBy: string,
  input: CreateTripInput,
): Promise<TripDocument> {
  const now = new Date();
  const departure = validDate(input.scheduledDeparture, "Scheduled departure");
  const arrival = input.expectedArrival
    ? validDate(input.expectedArrival, "Expected arrival")
    : undefined;

  validateArrival(departure, arrival);

  const trip: TripDocument = {
    organizationId,
    createdBy,
    driverId: validId(input.driverId, "Driver ID"),
    vehicleId: validId(input.vehicleId, "Vehicle ID"),
    origin: requiredText(input.origin, "Origin"),
    destination: requiredText(input.destination, "Destination"),
    scheduledDeparture: departure,
    expectedArrival: arrival,
    notes: optionalText(input.notes, "Notes"),
    status: "scheduled",
    createdAt: now,
    updatedAt: now,
  };

  const result = await tripCollection().insertOne(trip);

  return {
    ...trip,
    _id: result.insertedId,
  };
}

export async function getTrips(
  organizationId: string,
  query: TripListQuery,
  driverScope?: string,
) {
  const filter: Filter<TripDocument> = { organizationId };

  if (query.status) filter.status = query.status;
  if (query.driverId) filter.driverId = query.driverId;
  if (query.vehicleId) filter.vehicleId = query.vehicleId;

  if (driverScope) {
    filter.driverId = driverScope;
  }

  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(escaped, "i");

    filter.$or = [
      { origin: regex },
      { destination: regex },
      { driverId: regex },
      { vehicleId: regex },
    ];
  }

  const collection = tripCollection();
  const skip = (query.page - 1) * query.limit;

  const [trips, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    trips,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getTripById(
  organizationId: string,
  id: string,
  driverScope?: string,
): Promise<TripDocument> {
  const filter: Filter<TripDocument> = {
    _id: parseObjectId(id),
    organizationId,
  };

  if (driverScope) filter.driverId = driverScope;

  const trip = await tripCollection().findOne(filter);

  if (!trip) {
    throw new HttpError(404, "Trip not found.");
  }

  return trip;
}

export async function updateTrip(
  organizationId: string,
  id: string,
  input: UpdateTripInput,
): Promise<TripDocument> {
  const trip = await getTripById(organizationId, id);

  if (trip.status !== "scheduled") {
    throw new HttpError(409, "Only scheduled trips can be edited.");
  }

  const update: Partial<TripDocument> = {};

  if (input.driverId !== undefined) {
    update.driverId = validId(input.driverId, "Driver ID");
  }

  if (input.vehicleId !== undefined) {
    update.vehicleId = validId(input.vehicleId, "Vehicle ID");
  }

  if (input.origin !== undefined) {
    update.origin = requiredText(input.origin, "Origin");
  }

  if (input.destination !== undefined) {
    update.destination = requiredText(input.destination, "Destination");
  }

  if (input.scheduledDeparture !== undefined) {
    update.scheduledDeparture = validDate(
      input.scheduledDeparture,
      "Scheduled departure",
    );
  }

  if (input.expectedArrival !== undefined) {
    update.expectedArrival = input.expectedArrival
      ? validDate(input.expectedArrival, "Expected arrival")
      : undefined;
  }

  if (input.notes !== undefined) {
    update.notes = optionalText(input.notes, "Notes");
  }

  validateArrival(
    update.scheduledDeparture ?? trip.scheduledDeparture,
    update.expectedArrival ?? trip.expectedArrival,
  );

  update.updatedAt = new Date();

  await tripCollection().updateOne(
    { _id: trip._id, organizationId, status: "scheduled" },
    { $set: update },
  );

  return getTripById(organizationId, id);
}

export async function startTrip(
  organizationId: string,
  id: string,
  mileage: unknown,
): Promise<TripDocument> {
  const trip = await getTripById(organizationId, id);

  if (trip.status !== "scheduled") {
    throw new HttpError(409, "Only scheduled trips can be started.");
  }

  const startMileage = parseMileage(mileage, "Starting mileage");
  const now = new Date();

  const result = await tripCollection().updateOne(
    { _id: trip._id, organizationId, status: "scheduled" },
    {
      $set: {
        status: "in_progress",
        startMileage,
        actualDeparture: now,
        updatedAt: now,
      },
    },
  );

  if (result.modifiedCount !== 1) {
    throw new HttpError(409, "Trip status changed. Refresh and try again.");
  }

  return getTripById(organizationId, id);
}

export async function completeTrip(
  organizationId: string,
  id: string,
  mileage: unknown,
): Promise<TripDocument> {
  const trip = await getTripById(organizationId, id);

  if (trip.status !== "in_progress") {
    throw new HttpError(409, "Only in-progress trips can be completed.");
  }

  const endMileage = parseMileage(mileage, "Ending mileage");

  if (trip.startMileage !== undefined && endMileage < trip.startMileage) {
    throw new HttpError(
      400,
      "Ending mileage cannot be less than starting mileage.",
    );
  }

  const now = new Date();

  const result = await tripCollection().updateOne(
    { _id: trip._id, organizationId, status: "in_progress" },
    {
      $set: {
        status: "completed",
        endMileage,
        actualArrival: now,
        updatedAt: now,
      },
    },
  );

  if (result.modifiedCount !== 1) {
    throw new HttpError(409, "Trip status changed. Refresh and try again.");
  }

  return getTripById(organizationId, id);
}

export async function cancelTrip(
  organizationId: string,
  id: string,
  reason?: string,
): Promise<TripDocument> {
  const trip = await getTripById(organizationId, id);

  if (trip.status !== "scheduled") {
    throw new HttpError(409, "Only scheduled trips can be cancelled.");
  }

  const now = new Date();

  const result = await tripCollection().updateOne(
    { _id: trip._id, organizationId, status: "scheduled" },
    {
      $set: {
        status: "cancelled",
        cancellationReason: optionalText(reason, "Cancellation reason"),
        updatedAt: now,
      },
    },
  );

  if (result.modifiedCount !== 1) {
    throw new HttpError(409, "Trip status changed. Refresh and try again.");
  }

  return getTripById(organizationId, id);
}

export async function deleteTrip(
  organizationId: string,
  id: string,
): Promise<void> {
  const trip = await getTripById(organizationId, id);

  if (trip.status !== "scheduled") {
    throw new HttpError(409, "Only scheduled trips can be deleted.");
  }

  const result = await tripCollection().deleteOne({
    _id: trip._id,
    organizationId,
    status: "scheduled",
  });

  if (result.deletedCount !== 1) {
    throw new HttpError(409, "Unable to delete this trip.");
  }
}

export { validateTripStatus };
