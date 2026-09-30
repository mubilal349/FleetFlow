import { env } from "../config/env.js";

interface Vehicle {
  _id?: string;
  id?: string;
  organizationId?: string;
  status?: string;
  driverId?: string | null;
  currentMileage?: number;
  [key: string]: unknown;
}

interface VehicleResponse {
  success: boolean;
  message?: string;
  data?: {
    vehicle?: Vehicle;
  };
}

export class VehicleServiceClientError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message: string,
    statusCode = 500,
    code = "VEHICLE_SERVICE_ERROR",
  ) {
    super(message);

    this.name = "VehicleServiceClientError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function requestVehicleService(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<VehicleResponse> {
  const url = `${env.VEHICLE_SERVICE_URL}${path}`;

  console.log("🚗 VEHICLE SERVICE REQUEST:", {
    url,
    method: options.method || "GET",
  });

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    console.error("❌ VEHICLE SERVICE CONNECTION ERROR:", error);

    throw new VehicleServiceClientError(
      "Vehicle Service is unavailable.",
      503,
      "VEHICLE_SERVICE_UNAVAILABLE",
    );
  }

  let result: VehicleResponse;

  try {
    result = (await response.json()) as VehicleResponse;
  } catch {
    console.error("❌ VEHICLE SERVICE INVALID JSON:", {
      status: response.status,
      statusText: response.statusText,
    });

    throw new VehicleServiceClientError(
      "Vehicle Service returned an invalid response.",
      502,
      "INVALID_VEHICLE_SERVICE_RESPONSE",
    );
  }

  console.log("📥 VEHICLE SERVICE RESPONSE:", {
    url,
    status: response.status,
    statusText: response.statusText,
    result,
  });

  if (!response.ok || !result.success) {
    throw new VehicleServiceClientError(
      result.message || "Vehicle Service request failed.",
      response.status,
      "VEHICLE_SERVICE_REQUEST_FAILED",
    );
  }

  return result;
}
export async function getVehicleFromVehicleService(
  vehicleId: string,
  token: string,
): Promise<Vehicle | undefined> {
  const result = await requestVehicleService(`/vehicles/${vehicleId}`, token);

  return result.data?.vehicle;
}

export async function updateVehicleStatus(
  vehicleId: string,
  status: "available" | "assigned" | "in_trip" | "maintenance" | "inactive",
  token: string,
): Promise<Vehicle | undefined> {
  const result = await requestVehicleService(
    `/vehicles/${vehicleId}/status`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );

  return result.data?.vehicle;
}
