import { Maintenance } from "../models/Maintenance.js";
import {
  IMaintenanceAlert,
  MaintenanceAlert,
} from "../models/MaintenanceAlert.js";

import { calculateMaintenanceAlert } from "../utils/calculateDueStatus.js";

/**
 * Reminder service
 *
 * Responsible for checking active maintenance records
 * and creating/updating maintenance reminder alerts.
 *
 * Alert levels:
 * - upcoming
 * - warning
 * - critical
 *
 * Alert statuses:
 * - open
 * - acknowledged
 * - resolved
 */
class ReminderService {
  /**
   * Generate a reminder for a single maintenance record.
   *
   * If an alert already exists for the maintenance record,
   * it will be updated instead of creating a duplicate.
   */
  async generateReminder(
    maintenanceId: string,
    organizationId: string,
  ): Promise<IMaintenanceAlert | null> {
    const maintenance = await Maintenance.findOne({
      _id: maintenanceId,
      organizationId,
    });

    if (!maintenance) {
      return null;
    }

    /**
     * Completed maintenance does not need reminders.
     */
    if (maintenance.status === "completed") {
      return null;
    }

    /**
     * Calculate the current alert severity based on
     * the maintenance scheduled date.
     */
    const alertData = calculateMaintenanceAlert(maintenance.scheduledDate);

    if (!alertData) {
      return null;
    }

    const daysRemaining = alertData.daysRemaining;

    let message: string;

    if (daysRemaining < 0) {
      const overdueDays = Math.abs(daysRemaining);

      message =
        `${maintenance.serviceType} is overdue by ` +
        `${overdueDays} day${overdueDays === 1 ? "" : "s"}.`;
    } else if (daysRemaining === 0) {
      message = `${maintenance.serviceType} is due today.`;
    } else {
      message =
        `${maintenance.serviceType} is due in ` +
        `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`;
    }

    /**
     * Find an existing alert for this maintenance record.
     */
    const existingAlert = await MaintenanceAlert.findOne({
      maintenanceId: maintenance._id.toString(),
      organizationId,
    });

    /**
     * Update existing alert.
     *
     * This prevents duplicate alerts when the reminder
     * scheduler runs repeatedly.
     */
    if (existingAlert) {
      /**
       * Do not change a resolved alert automatically.
       *
       * This allows resolved alerts to remain part of
       * the alert history.
       */
      if (existingAlert.status === "resolved") {
        return existingAlert;
      }

      existingAlert.vehicleId = maintenance.vehicleId;
      existingAlert.severity = alertData.severity;
      existingAlert.title = alertData.title;
      existingAlert.message = message;
      existingAlert.dueDate = maintenance.scheduledDate;

      return existingAlert.save();
    }

    /**
     * Create a new alert.
     */
    const alert = new MaintenanceAlert({
      vehicleId: maintenance.vehicleId,
      maintenanceId: maintenance._id.toString(),
      organizationId,

      severity: alertData.severity,

      title: alertData.title,
      message,

      dueDate: maintenance.scheduledDate,

      status: "open",
    });

    return alert.save();
  }

  /**
   * Generate reminders for all active maintenance records
   * belonging to an organization.
   */
  async generateReminders(
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
    const maintenances = await Maintenance.find({
      organizationId,
      status: {
        $ne: "completed",
      },
    }).sort({
      scheduledDate: 1,
    });

    const alerts: IMaintenanceAlert[] = [];

    for (const maintenance of maintenances) {
      const alert = await this.generateReminder(
        maintenance._id.toString(),
        organizationId,
      );

      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  /**
   * Generate reminders for all organizations.
   *
   * This method is useful for the automatic scheduler.
   */
  async generateAllReminders(): Promise<
    {
      organizationId: string;
      alertsGenerated: number;
    }[]
  > {
    const organizations = await Maintenance.distinct("organizationId");

    const results: {
      organizationId: string;
      alertsGenerated: number;
    }[] = [];

    for (const organizationId of organizations) {
      const alerts = await this.generateReminders(organizationId);

      results.push({
        organizationId,
        alertsGenerated: alerts.length,
      });
    }

    return results;
  }

  /**
   * Get active reminders for an organization.
   */
  async getActiveReminders(
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
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
   * Get critical reminders.
   */
  async getCriticalReminders(
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
    return MaintenanceAlert.find({
      organizationId,
      severity: "critical",
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
   * Get warning reminders.
   */
  async getWarningReminders(
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
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
   * Get upcoming reminders.
   */
  async getUpcomingReminders(
    organizationId: string,
  ): Promise<IMaintenanceAlert[]> {
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
}

export const reminderService = new ReminderService();
