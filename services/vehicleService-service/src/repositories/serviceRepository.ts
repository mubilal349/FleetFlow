import ServiceModel, {
  IService,
  ServiceStatus,
  ServiceType,
} from "../models/serviceModel.js";

interface ListServicesFilters {
  vehicleId?: string;
  serviceType?: ServiceType;
  status?: ServiceStatus;
  page?: number;
  limit?: number;
}

class ServiceRepository {
  /**
   * Create a new service record
   */
  async create(data: Partial<IService>): Promise<IService> {
    const service = await ServiceModel.create(data);

    return service;
  }

  /**
   * Find all service records with optional filters
   */
  async findAll(filters: ListServicesFilters = {}) {
    const { vehicleId, serviceType, status, page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = {};

    if (vehicleId) {
      query.vehicleId = vehicleId;
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      ServiceModel.find(query)
        .sort({ serviceDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ServiceModel.countDocuments(query),
    ]);

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a service record by ID
   */
  async findById(id: string): Promise<IService | null> {
    return ServiceModel.findById(id);
  }

  /**
   * Update a service record
   */
  async update(id: string, data: Partial<IService>): Promise<IService | null> {
    return ServiceModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a service record
   */
  async delete(id: string): Promise<IService | null> {
    return ServiceModel.findByIdAndDelete(id);
  }
}

export const serviceRepository = new ServiceRepository();
