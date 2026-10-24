import { serviceUrls } from "../config/serviceUrls.js";
import { requestJson } from "./httpClient.js";

export interface TripInfo {
  id?: string;
  _id?: string;
  status?: string;
  organizationId?: string;
  organization?: string;
}

export const tripClient = {
  getById(tripId: string, token: string): Promise<unknown> {
    return requestJson<unknown>(
      serviceUrls.trip,
      `/trips/${encodeURIComponent(tripId)}`,
      "Trip Service",
      { token },
    );
  },

  async getTrip(tripId: string, token: string): Promise<TripInfo> {
    const result = await this.getById(tripId, token);

    const payload =
      typeof result === "object" && result !== null && "data" in result
        ? result.data
        : result;

    if (typeof payload !== "object" || payload === null) {
      throw new Error("Invalid trip response");
    }

    return payload as TripInfo;
  },
};
