import {
  type DriverDocument,
  type DriverStatus,
  type LicenseType,
} from "../models/Driver.js";

import { driverRepository } from "../repositories/driverRepository.js";

export interface CreateDriverInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  profileImage?: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiry: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };
  joiningDate?: string;
  status?: DriverStatus;
}

export interface UpdateDriverInput extends Partial<CreateDriverInput> {}

class DriverService {
  async createDriver(
    input: CreateDriverInput,
    organizationId: string,
    createdBy: string,
  ): Promise<DriverDocument> {
    const licenseNumber = input.licenseNumber.trim().toUpperCase();

    const existingLicense = await driverRepository.findByLicenseNumber(
      licenseNumber,
      organizationId,
    );

    if (existingLicense) {
      throw {
        statusCode: 409,
        message: "A driver with this license number already exists",
      };
    }

    if (input.email) {
      const existingEmail = await driverRepository.findByEmail(
        input.email,
        organizationId,
      );

      if (existingEmail) {
        throw {
          statusCode: 409,
          message: "A driver with this email already exists",
        };
      }
    }

    return driverRepository.create({
      organizationId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email?.trim().toLowerCase(),
      phone: input.phone.trim(),
      profileImage: input.profileImage,
      licenseNumber,
      licenseType: input.licenseType,
      licenseExpiry: new Date(input.licenseExpiry),
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      address: input.address?.trim(),
      emergencyContact: input.emergencyContact,
      joiningDate: input.joiningDate ? new Date(input.joiningDate) : undefined,
      status: input.status || "available",
      createdBy,
    });
  }

  async getDrivers(
    organizationId: string,
    filters: {
      search?: string;
      status?: DriverStatus;
      page?: number;
      limit?: number;
    },
  ) {
    const page = Math.max(filters.page || 1, 1);
    const limit = Math.min(Math.max(filters.limit || 10, 1), 100);

    const result = await driverRepository.findMany({
      organizationId,
      search: filters.search,
      status: filters.status,
      page,
      limit,
    });

    return {
      drivers: result.drivers,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getDriver(id: string, organizationId: string) {
    const driver = await driverRepository.findById(id, organizationId);

    if (!driver) {
      throw { statusCode: 404, message: "Driver not found" };
    }

    return driver;
  }

  async updateDriver(
    id: string,
    organizationId: string,
    input: UpdateDriverInput,
  ) {
    const existing = await driverRepository.findById(id, organizationId);

    if (!existing) {
      throw { statusCode: 404, message: "Driver not found" };
    }

    if (input.licenseNumber) {
      const licenseNumber = input.licenseNumber.trim().toUpperCase();
      const existingLicense = await driverRepository.findByLicenseNumber(
        licenseNumber,
        organizationId,
      );

      if (existingLicense && existingLicense._id.toString() !== id) {
        throw {
          statusCode: 409,
          message: "Another driver already uses this license number",
        };
      }

      input.licenseNumber = licenseNumber;
    }

    if (input.email) {
      const existingEmail = await driverRepository.findByEmail(
        input.email,
        organizationId,
      );

      if (existingEmail && existingEmail._id.toString() !== id) {
        throw {
          statusCode: 409,
          message: "Another driver already uses this email",
        };
      }

      input.email = input.email.trim().toLowerCase();
    }

    const updateData: Record<string, unknown> = {};

    if (input.firstName !== undefined)
      updateData.firstName = input.firstName.trim();
    if (input.lastName !== undefined)
      updateData.lastName = input.lastName.trim();
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone.trim();
    if (input.profileImage !== undefined)
      updateData.profileImage = input.profileImage;
    if (input.licenseNumber !== undefined)
      updateData.licenseNumber = input.licenseNumber;
    if (input.licenseType !== undefined)
      updateData.licenseType = input.licenseType;
    if (input.licenseExpiry !== undefined)
      updateData.licenseExpiry = new Date(input.licenseExpiry);
    if (input.dateOfBirth !== undefined)
      updateData.dateOfBirth = new Date(input.dateOfBirth);
    if (input.address !== undefined) updateData.address = input.address.trim();
    if (input.emergencyContact !== undefined)
      updateData.emergencyContact = input.emergencyContact;
    if (input.joiningDate !== undefined)
      updateData.joiningDate = new Date(input.joiningDate);
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await driverRepository.update(
      id,
      organizationId,
      updateData,
    );

    if (!updated) {
      throw { statusCode: 404, message: "Driver not found" };
    }

    return updated;
  }

  async updateDriverProfileImage(
    id: string,
    organizationId: string,
    profileImage: string,
  ) {
    const updated = await driverRepository.update(id, organizationId, {
      profileImage,
    });

    if (!updated) {
      throw { statusCode: 404, message: "Driver not found" };
    }

    return updated;
  }

  async updateDriverStatus(
    id: string,
    organizationId: string,
    status: DriverStatus,
  ) {
    const updated = await driverRepository.updateStatus(
      id,
      organizationId,
      status,
    );

    if (!updated) {
      throw { statusCode: 404, message: "Driver not found" };
    }

    return updated;
  }

  async deleteDriver(id: string, organizationId: string) {
    const deleted = await driverRepository.delete(id, organizationId);

    if (!deleted) {
      throw { statusCode: 404, message: "Driver not found" };
    }

    return deleted;
  }
}

export const driverService = new DriverService();
