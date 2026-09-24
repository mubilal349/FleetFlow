import {
  createVehicleRequest,
  findCustomerRequests,
  findRequestForCustomer,
  updateVehicleRequestStatus,
} from "../repositories/vehicleRequestRepository.js";

import { env } from "../config/env.js";

interface CreateVehicleRequestInput {
  organizationId: string;
  customerId: string;
  vehicleId: string;
  purpose: string;
  pickupLocation: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

interface VehicleResponse {
  _id: string;
  organizationId: string;
  status: string;
}

async function getVehicle(
  vehicleId: string,
  token: string,
): Promise<VehicleResponse | null> {
  const response = await fetch(
    `${env.VEHICLE_SERVICE_URL}/vehicles/${encodeURIComponent(vehicleId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    success?: boolean;
    data?: {
      vehicle?: VehicleResponse;
    };
  };

  if (!data.success || !data.data?.vehicle) {
    return null;
  }

  return data.data.vehicle;
}

export async function createVehicleRequestService(
  input: CreateVehicleRequestInput,
  token: string,
) {
  const vehicle = await getVehicle(input.vehicleId, token);

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  if (vehicle.organizationId !== input.organizationId) {
    throw new Error("Vehicle does not belong to your organization.");
  }

  if (vehicle.status !== "available") {
    throw new Error("This vehicle is not currently available for request.");
  }

  const request = await createVehicleRequest({
    organizationId: input.organizationId,
    customerId: input.customerId,
    vehicleId: input.vehicleId,
    purpose: input.purpose,
    pickupLocation: input.pickupLocation,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    notes: input.notes,
    status: "pending",
  });

  return request;
}

export async function getCustomerRequestsService(
  organizationId: string,
  customerId: string,
  page: number,
  limit: number,
) {
  return findCustomerRequests(organizationId, customerId, page, limit);
}

export async function getCustomerRequestService(
  id: string,
  organizationId: string,
  customerId: string,
) {
  const request = await findRequestForCustomer(id, organizationId, customerId);

  if (!request) {
    throw new Error("Vehicle request not found.");
  }

  return request;
}

export async function cancelVehicleRequestService(
  id: string,
  organizationId: string,
  customerId: string,
) {
  const request = await findRequestForCustomer(id, organizationId, customerId);

  if (!request) {
    throw new Error("Vehicle request not found.");
  }

  if (request.status !== "pending") {
    throw new Error("Only pending requests can be cancelled.");
  }

  return updateVehicleRequestStatus(id, "cancelled");
}
