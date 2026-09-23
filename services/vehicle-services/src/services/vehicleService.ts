import type { UpdateQuery } from "mongoose";

import {
  createVehicle,
  deleteVehicle,
  findVehicleById,
  findVehicleByRegistrationNumber,
  listVehicles,
  updateVehicle,
  type VehicleListOptions,
} from "../repositories/vehicleRepository.js";

import type { Vehicle } from "../models/Vehicle.js";

export class VehicleServiceError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message: string,
    statusCode = 400,
    code = "VEHICLE_SERVICE_ERROR",
  ) {
    super(message);

    this.name = "VehicleServiceError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface CreateVehicleInput {
  organizationId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: Vehicle["vehicleType"];
  color?: string;
  status?: Vehicle["status"];
  fuelType: Vehicle["fuelType"];
  fuelCapacity?: number;
  currentMileage?: number;
  driverId?: string | null;
  location?: Vehicle["location"];
  purchaseDate?: Date;
  purchasePrice?: number;
  insurance?: Vehicle["insurance"];
  notes?: string;
}

export async function createVehicleService(
  input: CreateVehicleInput,
): Promise<Vehicle> {
  const registrationNumber = input.registrationNumber.trim().toUpperCase();

  if (!registrationNumber) {
    throw new VehicleServiceError(
      "Registration number is required.",
      400,
      "REGISTRATION_NUMBER_REQUIRED",
    );
  }

  const existingVehicle = await findVehicleByRegistrationNumber(
    registrationNumber,
    input.organizationId,
  );

  if (existingVehicle) {
    throw new VehicleServiceError(
      "A vehicle with this registration number already exists.",
      409,
      "VEHICLE_ALREADY_EXISTS",
    );
  }

  return createVehicle({
    ...input,
    registrationNumber,
  });
}

export async function getVehicleService(
  id: string,
  organizationId: string,
): Promise<Vehicle> {
  const vehicle = await findVehicleById(id, organizationId);

  if (!vehicle) {
    throw new VehicleServiceError(
      "Vehicle not found.",
      404,
      "VEHICLE_NOT_FOUND",
    );
  }

  return vehicle;
}

export async function getVehiclesService(options: VehicleListOptions) {
  return listVehicles(options);
}

export async function updateVehicleService(
  id: string,
  organizationId: string,
  updates: UpdateQuery<Vehicle>,
): Promise<Vehicle> {
  if (
    updates.registrationNumber !== undefined &&
    typeof updates.registrationNumber === "string"
  ) {
    const registrationNumber = updates.registrationNumber.trim().toUpperCase();

    const existingVehicle = await findVehicleByRegistrationNumber(
      registrationNumber,
      organizationId,
    );

    if (existingVehicle && existingVehicle._id.toString() !== id) {
      throw new VehicleServiceError(
        "A vehicle with this registration number already exists.",
        409,
        "VEHICLE_ALREADY_EXISTS",
      );
    }

    updates.registrationNumber = registrationNumber;
  }

  const vehicle = await updateVehicle(id, organizationId, updates);

  if (!vehicle) {
    throw new VehicleServiceError(
      "Vehicle not found.",
      404,
      "VEHICLE_NOT_FOUND",
    );
  }

  return vehicle;
}

export async function deactivateVehicleService(
  id: string,
  organizationId: string,
): Promise<Vehicle> {
  const vehicle = await deleteVehicle(id, organizationId);

  if (!vehicle) {
    throw new VehicleServiceError(
      "Vehicle not found.",
      404,
      "VEHICLE_NOT_FOUND",
    );
  }

  return vehicle;
}
