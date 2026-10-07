import { MaintenanceAlert } from "../models/MaintenanceAlert.js";

import { Maintenance } from "../models/Maintenance.js";

import { calculateMaintenanceAlert } from "../utils/calculateDueStatus.js";

export async function generateMaintenanceAlert(
  maintenanceId: string,
  organizationId: string,
) {
  const maintenance = await Maintenance.findOne({
    _id: maintenanceId,
    organizationId,
  });

  if (!maintenance) {
    return null;
  }

  if (maintenance.status === "completed") {
    return null;
  }

  const alertData = calculateMaintenanceAlert(maintenance.scheduledDate);

  if (!alertData) {
    return null;
  }

  const message =
    alertData.daysRemaining < 0
      ? `${maintenance.serviceType} is overdue.`
      : `${maintenance.serviceType} is due in ${alertData.daysRemaining} day(s).`;

  const alert = await MaintenanceAlert.findOneAndUpdate(
    {
      maintenanceId: maintenance._id.toString(),
      organizationId,
    },
    {
      vehicleId: maintenance.vehicleId,
      maintenanceId: maintenance._id.toString(),
      organizationId,
      severity: alertData.severity,
      title: alertData.title,
      message,
      dueDate: maintenance.scheduledDate,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return alert;
}

export async function getMaintenanceAlerts(organizationId: string) {
  const maintenances = await Maintenance.find({
    organizationId,
    status: {
      $ne: "completed",
    },
  });

  const alerts = [];

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

export async function updateMaintenanceAlertStatus(
  alertId: string,
  organizationId: string,
  status: "open" | "acknowledged" | "resolved",
) {
  return MaintenanceAlert.findOneAndUpdate(
    {
      _id: alertId,
      organizationId,
    },
    {
      status,
    },
    {
      new: true,
      runValidators: true,
    },
  );
}
