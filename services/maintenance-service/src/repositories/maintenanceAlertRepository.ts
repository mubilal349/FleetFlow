import {
  MaintenanceAlert,
  IMaintenanceAlert,
} from "../models/MaintenanceAlert.js";

class MaintenanceAlertRepository {
  /**
   * Create a new maintenance alert
   */
  async create(data: Partial<IMaintenanceAlert>): Promise<IMaintenanceAlert> {
    const alert = new MaintenanceAlert(data);

    return alert.save();
  }

  /**
   * Get all alerts for an organization
   */
  async findAll(organizationId: string): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
    })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Get alerts by status
   */
  async findByStatus(
    organizationId: string,
    status: "open" | "acknowledged" | "resolved",
  ): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      status,
    })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Get alerts by severity
   */
  async findBySeverity(
    organizationId: string,
    severity: "critical" | "warning" | "upcoming",
  ): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      severity,
    })
      .sort({
        dueDate: 1,
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Find a single alert by ID
   */
  async findById(
    alertId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert | null> {
    return MaintenanceAlert.findOne({
      _id: alertId,
      organizationId,
    }).exec();
  }

  /**
   * Get all alerts related to a specific vehicle
   */
  async findByVehicle(
    vehicleId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      vehicleId,
      organizationId,
    })
      .sort({
        dueDate: 1,
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Get all alerts related to a maintenance record
   */
  async findByMaintenance(
    maintenanceId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      maintenanceId,
      organizationId,
    })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Get all open alerts
   */
  async findOpen(organizationId: string): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      status: "open",
    })
      .sort({
        dueDate: 1,
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Count open alerts
   */
  async countOpen(organizationId: string): Promise<number> {
    return MaintenanceAlert.countDocuments({
      organizationId,
      status: "open",
    }).exec();
  }

  /**
   * Get unresolved alerts.
   *
   * Unresolved means either open or acknowledged.
   */
  async findUnresolved(organizationId: string): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      status: {
        $in: ["open", "acknowledged"],
      },
    })
      .sort({
        dueDate: 1,
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Acknowledge an alert
   */
  async acknowledge(
    alertId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert | null> {
    return MaintenanceAlert.findOneAndUpdate(
      {
        _id: alertId,
        organizationId,
        status: {
          $ne: "resolved",
        },
      },
      {
        $set: {
          status: "acknowledged",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  }

  /**
   * Resolve an alert
   */
  async resolve(
    alertId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert | null> {
    return MaintenanceAlert.findOneAndUpdate(
      {
        _id: alertId,
        organizationId,
        status: {
          $ne: "resolved",
        },
      },
      {
        $set: {
          status: "resolved",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  }

  /**
   * Update an alert
   */
  async update(
    alertId: string,
    organizationId: string,
    updateData: Partial<IMaintenanceAlert>,
  ): Promise<IMaintenanceAlert | null> {
    return MaintenanceAlert.findOneAndUpdate(
      {
        _id: alertId,
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
   * Delete an alert
   */
  async delete(
    alertId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert | null> {
    return MaintenanceAlert.findOneAndDelete({
      _id: alertId,
      organizationId,
    }).exec();
  }

  /**
   * Find an existing unresolved alert for a
   * maintenance record and severity.
   *
   * This prevents the reminder scheduler from creating
   * duplicate alerts every time it runs.
   */
  async findExistingAlert(
    maintenanceId: string,
    organizationId: string,
    severity: "critical" | "warning" | "upcoming",
  ): Promise<IMaintenanceAlert | null> {
    return MaintenanceAlert.findOne({
      maintenanceId,
      organizationId,
      severity,
      status: {
        $in: ["open", "acknowledged"],
      },
    })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Find active alerts for a maintenance record.
   *
   * Active means the alert has not been resolved.
   */
  async findActiveByMaintenance(
    maintenanceId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      maintenanceId,
      organizationId,
      status: {
        $in: ["open", "acknowledged"],
      },
    })
      .sort({
        dueDate: 1,
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Find upcoming alerts
   */
  async findUpcoming(organizationId: string): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      severity: "upcoming",
      status: {
        $in: ["open", "acknowledged"],
      },
    })
      .sort({
        dueDate: 1,
      })
      .exec();
  }

  /**
   * Find warning alerts
   */
  async findWarnings(organizationId: string): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      severity: "warning",
      status: {
        $in: ["open", "acknowledged"],
      },
    })
      .sort({
        dueDate: 1,
      })
      .exec();
  }

  /**
   * Find critical alerts
   */
  async findCritical(organizationId: string): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      severity: "critical",
      status: {
        $in: ["open", "acknowledged"],
      },
    })
      .sort({
        dueDate: 1,
        createdAt: -1,
      })
      .exec();
  }

  /**
   * Find alerts whose due date has passed.
   */
  async findOverdue(organizationId: string): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      dueDate: {
        $lt: new Date(),
      },
      status: {
        $in: ["open", "acknowledged"],
      },
    })
      .sort({
        dueDate: 1,
      })
      .exec();
  }
}

export const maintenanceAlertRepository = new MaintenanceAlertRepository();
