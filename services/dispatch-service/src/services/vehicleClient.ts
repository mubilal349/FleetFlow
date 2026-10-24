import { serviceUrls } from "../config/serviceUrls.js";
import { requestJson } from "./httpClient.js";
import { DispatchServiceError } from "./dispatchService.js";

export interface VehicleInfo {
  id?: string;
  _id?: string;
  registrationNumber?: string;
  status?: string;
  organizationId?: string;
  organization?: string;
  currentMileage?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapVehicleResponse(result: unknown): VehicleInfo {
  let payload: unknown = result;

  // Support common API response wrappers.
  for (let i = 0; i < 3; i++) {
    if (!isRecord(payload)) {
      throw new DispatchServiceError(
        "Vehicle Service returned an invalid response",
        502,
      );
    }

    // A vehicle object should have a recognizable identifier.
    if ("_id" in payload || "id" in payload) {
      return payload as VehicleInfo;
    }

    if ("data" in payload) {
      payload = payload.data;
      continue;
    }

    if ("vehicle" in payload) {
      payload = payload.vehicle;
      continue;
    }

    throw new DispatchServiceError(
      "Vehicle Service response did not contain a vehicle object",
      502,
    );
  }

  throw new DispatchServiceError(
    "Vehicle Service response has too many nested wrappers",
    502,
  );
}

export const vehicleClient = {
  getById(vehicleId: string, token: string): Promise<unknown> {
    return requestJson<unknown>(
      serviceUrls.vehicle,
      `/vehicles/${encodeURIComponent(vehicleId)}`,
      "Vehicle Service",
      { token },
    );
  },

  async getVehicle(vehicleId: string, token: string): Promise<VehicleInfo> {
    if (!vehicleId?.trim()) {
      throw new DispatchServiceError("Vehicle ID is required", 400);
    }

    const result = await this.getById(vehicleId, token);
    const vehicle = unwrapVehicleResponse(result);

    if (!vehicle.status?.trim()) {
      throw new DispatchServiceError(
        "Vehicle Service returned a vehicle without a status. Check the Vehicle Service response mapping.",
        502,
      );
    }

    return vehicle;
  },
};
