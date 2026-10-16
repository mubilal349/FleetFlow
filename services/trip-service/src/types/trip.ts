import type { ObjectId } from "mongodb";

export const TRIP_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type TripStatus = (typeof TRIP_STATUSES)[number];

export interface TripDocument {
  _id?: ObjectId;
  organizationId: string;
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  scheduledDeparture: Date;
  expectedArrival?: Date;
  actualDeparture?: Date;
  actualArrival?: Date;
  startMileage?: number;
  endMileage?: number;
  status: TripStatus;
  notes?: string;
  cancellationReason?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTripInput {
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  expectedArrival?: string;
  notes?: string;
}

export interface UpdateTripInput {
  driverId?: string;
  vehicleId?: string;
  origin?: string;
  destination?: string;
  scheduledDeparture?: string;
  expectedArrival?: string;
  notes?: string;
}

export interface TripListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: TripStatus;
  driverId?: string;
  vehicleId?: string;
}
