import { Maintenance } from "../models/Maintenance.js";

interface CreateMaintenanceData {
  vehicleId: string;
  organizationId: string;
  serviceType: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  status?: "scheduled" | "in_progress" | "completed" | "overdue";
  priority?: "low" | "medium" | "high" | "critical";
  reminderDays?: number;
  notes?: string;
}

interface UpdateMaintenanceData {
  serviceType?: string;
  description?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  status?: "scheduled" | "in_progress" | "completed" | "overdue";
  priority?: "low" | "medium" | "high" | "critical";
  reminderDays?: number;
  notes?: string;
}

export async function createMaintenance(data: CreateMaintenanceData) {
  return Maintenance.create(data);
}

export async function getMaintenances(organizationId: string) {
  return Maintenance.find({
    organizationId,
  }).sort({
    scheduledDate: 1,
  });
}

export async function getMaintenanceById(
  maintenanceId: string,
  organizationId: string,
) {
  return Maintenance.findOne({
    _id: maintenanceId,
    organizationId,
  });
}

export async function updateMaintenance(
  maintenanceId: string,
  organizationId: string,
  data: UpdateMaintenanceData,
) {
  return Maintenance.findOneAndUpdate(
    {
      _id: maintenanceId,
      organizationId,
    },
    data,
    {
      new: true,
      runValidators: true,
    },
  );
}

export async function deleteMaintenance(
  maintenanceId: string,
  organizationId: string,
) {
  return Maintenance.findOneAndDelete({
    _id: maintenanceId,
    organizationId,
  });
}
