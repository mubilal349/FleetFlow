import type { FilterQuery, UpdateQuery } from "mongoose";

import { VehicleModel, type Vehicle } from "../models/Vehicle.js";

export interface VehicleListOptions {
  organizationId: string;
  status?: Vehicle["status"];
  vehicleType?: Vehicle["vehicleType"];
  driverId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VehicleListResult {
  vehicles: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  return VehicleModel.create(data);
}

export async function findVehicleById(
  id: string,
  organizationId: string,
): Promise<Vehicle | null> {
  return VehicleModel.findOne({
    _id: id,
    organizationId,
  }).exec();
}

export async function findVehicleByRegistrationNumber(
  registrationNumber: string,
  organizationId: string,
): Promise<Vehicle | null> {
  return VehicleModel.findOne({
    registrationNumber: registrationNumber.toUpperCase(),
    organizationId,
  }).exec();
}

export async function listVehicles(
  options: VehicleListOptions,
): Promise<VehicleListResult> {
  const {
    organizationId,
    status,
    vehicleType,
    driverId,
    search,
    page = 1,
    limit = 20,
  } = options;

  const filter: FilterQuery<Vehicle> = {
    organizationId,
  };

  if (status) {
    filter.status = status;
  }

  if (vehicleType) {
    filter.vehicleType = vehicleType;
  }

  if (driverId) {
    filter.driverId = driverId;
  }

  if (search?.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const searchRegex = new RegExp(escapedSearch, "i");

    filter.$or = [
      { registrationNumber: searchRegex },
      { make: searchRegex },
      { model: searchRegex },
    ];
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);

  const skip = (safePage - 1) * safeLimit;

  const [vehicles, total] = await Promise.all([
    VehicleModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .exec(),

    VehicleModel.countDocuments(filter).exec(),
  ]);

  return {
    vehicles,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

/**
 * Update vehicle fields while keeping the vehicle
 * inside the authenticated organization.
 */
export async function updateVehicle(
  id: string,
  organizationId: string,
  updates: UpdateQuery<Vehicle>,
): Promise<Vehicle | null> {
  return VehicleModel.findOneAndUpdate(
    {
      _id: id,
      organizationId,
    },
    updates,
    {
      new: true,
      runValidators: true,
    },
  ).exec();
}

/**
 * Permanently delete a vehicle from MongoDB.
 */
export async function deleteVehicle(
  id: string,
  organizationId: string,
): Promise<Vehicle | null> {
  return VehicleModel.findOneAndDelete({
    _id: id,
    organizationId,
  }).exec();
}

/**
 * Soft-deactivate a vehicle.
 */
export async function deactivateVehicle(
  id: string,
  organizationId: string,
): Promise<Vehicle | null> {
  return VehicleModel.findOneAndUpdate(
    {
      _id: id,
      organizationId,
    },
    {
      $set: {
        status: "inactive",
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).exec();
}

export async function countVehicles(
  organizationId: string,
  filter: FilterQuery<Vehicle> = {},
): Promise<number> {
  return VehicleModel.countDocuments({
    ...filter,
    organizationId,
  }).exec();
}
