import {
  IService,
  ServiceStatus,
  ServiceType,
} from "../models/serviceModel.js";

import { serviceRepository } from "../repositories/serviceRepository.js";

export interface CreateServiceData {
  vehicleId: string;
  serviceType: ServiceType;
  serviceDate: Date;
  nextServiceDate?: Date;
  mileage: number;
  cost: number;
  serviceProvider?: string;
  notes?: string;
  status?: ServiceStatus;
  createdBy: string;
}

export interface UpdateServiceData {
  vehicleId?: string;
  serviceType?: ServiceType;
  serviceDate?: Date;
  nextServiceDate?: Date;
  mileage?: number;
  cost?: number;
  serviceProvider?: string;
  notes?: string;
  status?: ServiceStatus;
}

export interface ListServicesFilters {
  vehicleId?: string;
  serviceType?: ServiceType;
  status?: ServiceStatus;
  page?: number;
  limit?: number;
}

export class ServiceServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "ServiceServiceError";
    this.statusCode = statusCode;
  }
}

class ServiceService {
  /**
   * Create a new vehicle service record
   */
  async createService(data: CreateServiceData): Promise<IService> {
    if (!data.vehicleId) {
      throw new ServiceServiceError("Vehicle ID is required", 400);
    }

    if (!data.createdBy) {
      throw new ServiceServiceError("Created by user ID is required", 400);
    }

    if (data.mileage < 0) {
      throw new ServiceServiceError("Mileage cannot be negative", 400);
    }

    if (data.cost < 0) {
      throw new ServiceServiceError("Cost cannot be negative", 400);
    }

    if (data.nextServiceDate && data.nextServiceDate < data.serviceDate) {
      throw new ServiceServiceError(
        "Next service date cannot be before service date",
        400,
      );
    }

    const service = await serviceRepository.create(data);

    return service;
  }

  /**
   * Get all vehicle service records
   */
  async getServices(filters: ListServicesFilters = {}) {
    return serviceRepository.findAll(filters);
  }

  /**
   * Get service history for a specific vehicle
   */
  async getServiceHistoryByVehicle(vehicleId: string) {
    if (!vehicleId) {
      throw new ServiceServiceError("Vehicle ID is required", 400);
    }

    return serviceRepository.findAll({
      vehicleId,
    });
  }

  /**
   * Get one service record
   */
  async getServiceById(id: string): Promise<IService> {
    const service = await serviceRepository.findById(id);

    if (!service) {
      throw new ServiceServiceError("Service record not found", 404);
    }

    return service;
  }

  /**
   * Update a service record
   */
  async updateService(id: string, data: UpdateServiceData): Promise<IService> {
    const existingService = await serviceRepository.findById(id);

    if (!existingService) {
      throw new ServiceServiceError("Service record not found", 404);
    }

    if (data.mileage !== undefined && data.mileage < 0) {
      throw new ServiceServiceError("Mileage cannot be negative", 400);
    }

    if (data.cost !== undefined && data.cost < 0) {
      throw new ServiceServiceError("Cost cannot be negative", 400);
    }

    const serviceDate = data.serviceDate ?? existingService.serviceDate;

    const nextServiceDate =
      data.nextServiceDate ?? existingService.nextServiceDate;

    if (nextServiceDate && nextServiceDate < serviceDate) {
      throw new ServiceServiceError(
        "Next service date cannot be before service date",
        400,
      );
    }

    const updatedService = await serviceRepository.update(id, data);

    if (!updatedService) {
      throw new ServiceServiceError("Unable to update service record", 500);
    }

    return updatedService;
  }

  /**
   * Delete a service record
   */
  async deleteService(id: string): Promise<IService> {
    const existingService = await serviceRepository.findById(id);

    if (!existingService) {
      throw new ServiceServiceError("Service record not found", 404);
    }

    const deletedService = await serviceRepository.delete(id);

    if (!deletedService) {
      throw new ServiceServiceError("Unable to delete service record", 500);
    }

    return deletedService;
  }
}

export const serviceService = new ServiceService();
