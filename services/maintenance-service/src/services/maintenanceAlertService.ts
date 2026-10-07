import { Maintenance } from "../models/Maintenance.js";

import { IMaintenanceAlert } from "../models/MaintenanceAlert.js";

import { maintenanceAlertRepository } from "../repositories/maintenanceAlertRepository.js";

import { calculateMaintenanceAlert } from "../utils/calculateDueStatus.js";

/**
 * Generate or update an alert for a single maintenance record.
 */
export async function generateMaintenanceAlert(
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
   * Completed maintenance does not need an active alert.
   */
  if (maintenance.status === "completed") {
    return null;
  }

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
   * Keep one alert per maintenance record.
   *
   * The alert severity is updated as the maintenance
   * moves closer to or beyond its SLA due date.
   */
  const alert = await MaintenanceAlertUpdate(
    maintenance._id.toString(),
    organizationId,
    {
      vehicleId: maintenance.vehicleId,
      maintenanceId: maintenance._id.toString(),
      organizationId,
      severity: alertData.severity,
      title: alertData.title,
      message,
      dueDate: maintenance.scheduledDate,
    },
  );

  return alert;
}

/**
 * Internal helper used to create/update the alert.
 */
async function MaintenanceAlertUpdate(
  maintenanceId: string,
  organizationId: string,
  data: {
    vehicleId: string;
    maintenanceId: string;
    organizationId: string;
    severity: "critical" | "warning" | "upcoming";
    title: string;
    message: string;
    dueDate: Date;
  },
): Promise<IMaintenanceAlert> {
  const existingAlert = await maintenanceAlertRepository.findByMaintenance(
    maintenanceId,
    organizationId,
  );

  /**
   * If an alert already exists, update the existing alert.
   *
   * We intentionally preserve "acknowledged" status.
   * If the alert becomes more severe, it will still be
   * visible as acknowledged until the user resolves it.
   */
  if (existingAlert.length > 0) {
    const currentAlert = existingAlert[0];

    const updated = await maintenanceAlertRepository.update(
      currentAlert._id.toString(),
      organizationId,
      {
        vehicleId: data.vehicleId,
        severity: data.severity,
        title: data.title,
        message: data.message,
        dueDate: data.dueDate,
      },
    );

    if (updated) {
      return updated;
    }
  }

  /**
   * No existing alert — create a new one.
   */
  return maintenanceAlertRepository.create({
    vehicleId: data.vehicleId,
    maintenanceId: data.maintenanceId,
    organizationId: data.organizationId,
    severity: data.severity,
    title: data.title,
    message: data.message,
    dueDate: data.dueDate,
    status: "open",
  });
}

/**
 * Generate alerts for all active maintenance records
 * belonging to an organization.
 */
export async function getMaintenanceAlerts(
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
    const alert = await generateMaintenanceAlert(
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
 * Get existing alerts without regenerating them.
 */
export async function getExistingMaintenanceAlerts(
  organizationId: string,
): Promise<IMaintenanceAlert[]> {
  return maintenanceAlertRepository.findAll(organizationId);
}

/**
 * Get open maintenance alerts.
 */
export async function getOpenMaintenanceAlerts(
  organizationId: string,
): Promise<IMaintenanceAlert[]> {
  return maintenanceAlertRepository.findOpen(organizationId);
}

/**
 * Get critical maintenance alerts.
 */
export async function getCriticalMaintenanceAlerts(
  organizationId: string,
): Promise<IMaintenanceAlert[]> {
  return maintenanceAlertRepository.findCritical(organizationId);
}

/**
 * Get upcoming maintenance alerts.
 */
export async function getUpcomingMaintenanceAlerts(
  organizationId: string,
): Promise<IMaintenanceAlert[]> {
  return maintenanceAlertRepository.findUpcoming(organizationId);
}

/**
 * Get warning maintenance alerts.
 */
export async function getWarningMaintenanceAlerts(
  organizationId: string,
): Promise<IMaintenanceAlert[]> {
  return maintenanceAlertRepository.findWarnings(organizationId);
}

/**
 * Get a single alert.
 */
export async function getMaintenanceAlertById(
  alertId: string,
  organizationId: string,
): Promise<IMaintenanceAlert | null> {
  return maintenanceAlertRepository.findById(alertId, organizationId);
}

/**
 * Acknowledge an alert.
 */
export async function acknowledgeMaintenanceAlert(
  alertId: string,
  organizationId: string,
): Promise<IMaintenanceAlert | null> {
  return maintenanceAlertRepository.acknowledge(alertId, organizationId);
}

/**
 * Resolve an alert.
 */
export async function resolveMaintenanceAlert(
  alertId: string,
  organizationId: string,
): Promise<IMaintenanceAlert | null> {
  return maintenanceAlertRepository.resolve(alertId, organizationId);
}

/**
 * Update maintenance alert status.
 */
export async function updateMaintenanceAlertStatus(
  alertId: string,
  organizationId: string,
  status: "open" | "acknowledged" | "resolved",
): Promise<IMaintenanceAlert | null> {
  return maintenanceAlertRepository.update(alertId, organizationId, {
    status,
  });
}
