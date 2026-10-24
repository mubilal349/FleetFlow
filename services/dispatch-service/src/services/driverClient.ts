import { serviceUrls } from "../config/serviceUrls.js";
import { requestJson } from "./httpClient.js";

export interface DriverInfo {
  id?: string;
  _id?: string;
  name?: string;
  status?: string;
  organizationId?: string;
  organization?: string;
}

export const driverClient = {
  getById(driverId: string, token: string): Promise<unknown> {
    return requestJson<unknown>(
      serviceUrls.driver,
      `/drivers/${encodeURIComponent(driverId)}`,
      "Driver Service",
      { token },
    );
  },

  async getDriver(driverId: string, token: string): Promise<DriverInfo> {
    const result = await this.getById(driverId, token);

    const payload =
      typeof result === "object" && result !== null && "data" in result
        ? result.data
        : result;

    if (typeof payload !== "object" || payload === null) {
      throw new Error("Invalid driver response");
    }

    return payload as DriverInfo;
  },
};
