import { serviceUrls } from "../config/serviceUrls.js";
import { requestJson } from "./httpClient.js";

export interface VehicleInfo {
  id?: string;
  _id?: string;
  registrationNumber?: string;
  status?: string;
  organizationId?: string;
  organization?: string;
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
    const result = await this.getById(vehicleId, token);

    // Adjust this mapping if your Vehicle Service uses another response shape.
    const payload =
      typeof result === "object" && result !== null && "data" in result
        ? result.data
        : result;

    if (typeof payload !== "object" || payload === null) {
      throw new Error("Invalid vehicle response");
    }

    return payload as VehicleInfo;
  },
};
