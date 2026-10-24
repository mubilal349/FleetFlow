import { env } from "./env.js";

export const serviceUrls = {
  gateway: env.API_GATEWAY_URL,
  vehicle: env.VEHICLE_SERVICE_URL,
  vehicleAssignment: env.VEHICLE_ASSIGNMENT_SERVICE_URL,
  driver: env.DRIVER_SERVICE_URL,
  trip: env.TRIP_SERVICE_URL,
} as const;
