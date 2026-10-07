import { Maintenance, IMaintenance } from "../models/Maintenance.js";

class MaintenanceRepository {
  /**
   * Create a new maintenance record
   */
  async create(data: Partial<IMaintenance>): Promise<IMaintenance> {
    const maintenance = new Maintenance(data);

    return maintenance.save();
  }

  /**
   * Get all maintenance records for an organization
   */
  async findAll(organizationId: string): Promise<IMaintenance[]> {
    return Maintenance.find({
      organizationId,
    })
      .sort({ scheduledDate: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Get a maintenance record by ID
   * Ensures the record belongs to the organization
   */
  async findById(
    maintenanceId: string,
    organizationId: string,
  ): Promise<IMaintenance | null> {
    return Maintenance.findOne({
      _id: maintenanceId,
      organizationId,
    }).exec();
  }

  /**
   * Update a maintenance record
   */
  async update(
    maintenanceId: string,
    organizationId: string,
    updateData: Record<string, unknown>,
  ): Promise<IMaintenance | null> {
    return Maintenance.findOneAndUpdate(
      {
        _id: maintenanceId,
        organizationId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  }

  /**
   * Delete a maintenance record
   */
  async delete(
    maintenanceId: string,
    organizationId: string,
  ): Promise<IMaintenance | null> {
    return Maintenance.findOneAndDelete({
      _id: maintenanceId,
      organizationId,
    }).exec();
  }

  /**
   * Get maintenance records for a specific vehicle
   */
  async findByVehicle(
    vehicleId: string,
    organizationId: string,
  ): Promise<IMaintenance[]> {
    return Maintenance.find({
      vehicleId,
      organizationId,
    })
      .sort({ scheduledDate: -1 })
      .exec();
  }

  /**
   * Get maintenance records by status
   */
  async findByStatus(
    status: string,
    organizationId: string,
  ): Promise<IMaintenance[]> {
    return Maintenance.find({
      status,
      organizationId,
    })
      .sort({ scheduledDate: 1 })
      .exec();
  }

  /**
   * Get overdue maintenance records
   */
  async findOverdue(organizationId: string): Promise<IMaintenance[]> {
    return Maintenance.find({
      organizationId,
      status: {
        $in: ["scheduled", "overdue"],
      },
      scheduledDate: {
        $lt: new Date(),
      },
    })
      .sort({ scheduledDate: 1 })
      .exec();
  }

  /**
   * Get upcoming maintenance records
   */
  async findUpcoming(
    organizationId: string,
    days = 30,
  ): Promise<IMaintenance[]> {
    const now = new Date();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return Maintenance.find({
      organizationId,
      scheduledDate: {
        $gte: now,
        $lte: futureDate,
      },
      status: {
        $in: ["scheduled", "in_progress"],
      },
    })
      .sort({ scheduledDate: 1 })
      .exec();
  }
}

export const maintenanceRepository = new MaintenanceRepository();
