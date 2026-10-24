import { serviceUrls } from "../config/serviceUrls.js";
import { requestJson } from "./httpClient.js";

export interface CreateAssignmentInput {
  vehicleId: string;
  driverId: string;
  startingMileage: number;
  expectedReturnDate?: string | null;
  notes?: string;
}

export const assignmentClient = {
  create(input: CreateAssignmentInput, token: string): Promise<unknown> {
    return requestJson<unknown>(
      serviceUrls.vehicleAssignment,
      "/assignments",
      "Vehicle Assignment Service",
      {
        method: "POST",
        token,
        body: input,
      },
    );
  },

  getById(assignmentId: string, token: string): Promise<unknown> {
    return requestJson<unknown>(
      serviceUrls.vehicleAssignment,
      `/assignments/${encodeURIComponent(assignmentId)}`,
      "Vehicle Assignment Service",
      { token },
    );
  },
};
