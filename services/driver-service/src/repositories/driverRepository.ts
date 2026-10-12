import {
  Driver,
  type DriverDocument,
  type DriverStatus,
} from "../models/Driver.js";

export interface DriverFilters {
  organizationId: string;
  search?: string;
  status?: DriverStatus;
  page?: number;
  limit?: number;
}

class DriverRepository {
  async create(data: Partial<DriverDocument>): Promise<DriverDocument> {
    return Driver.create(data);
  }

  async findById(
    id: string,
    organizationId: string,
  ): Promise<DriverDocument | null> {
    return Driver.findOne({
      _id: id,
      organizationId,
    });
  }

  async findByLicenseNumber(
    licenseNumber: string,
    organizationId: string,
  ): Promise<DriverDocument | null> {
    return Driver.findOne({
      licenseNumber: licenseNumber.toUpperCase(),
      organizationId,
    });
  }

  async findByEmail(
    email: string,
    organizationId: string,
  ): Promise<DriverDocument | null> {
    return Driver.findOne({
      email: email.toLowerCase(),
      organizationId,
    });
  }

  async findMany(filters: DriverFilters): Promise<{
    drivers: DriverDocument[];
    total: number;
  }> {
    const { organizationId, search, status, page = 1, limit = 10 } = filters;

    const query: Record<string, unknown> = {
      organizationId,
    };

    if (status) {
      query.status = status;
    }

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { licenseNumber: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      Driver.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),

      Driver.countDocuments(query),
    ]);

    return {
      drivers,
      total,
    };
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<DriverDocument>,
  ): Promise<DriverDocument | null> {
    return Driver.findOneAndUpdate(
      {
        _id: id,
        organizationId,
      },
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: DriverStatus,
  ): Promise<DriverDocument | null> {
    return Driver.findOneAndUpdate(
      {
        _id: id,
        organizationId,
      },
      {
        $set: {
          status,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async delete(
    id: string,
    organizationId: string,
  ): Promise<DriverDocument | null> {
    return Driver.findOneAndDelete({
      _id: id,
      organizationId,
    });
  }
}

export const driverRepository = new DriverRepository();
