import { reportingRepository } from "../repositories/reportingRepository.js";

import type {
  VehicleDashboardReport,
  VehicleOverview,
  VehicleStatusReport,
  VehicleTypeReport,
  VehicleUtilizationReport,
} from "../types/reportingTypes.js";

export async function getVehicleOverview(
  organizationId: string,
): Promise<VehicleOverview> {
  return reportingRepository.getVehicleOverview(organizationId);
}

export async function getVehicleStatusReport(
  organizationId: string,
): Promise<VehicleStatusReport[]> {
  return reportingRepository.getVehicleStatusReport(organizationId);
}

export async function getVehicleTypeReport(
  organizationId: string,
): Promise<VehicleTypeReport[]> {
  return reportingRepository.getVehicleTypeReport(organizationId);
}

export async function getVehicleUtilization(
  organizationId: string,
): Promise<VehicleUtilizationReport> {
  const overview = await reportingRepository.getVehicleOverview(organizationId);

  const activeVehicles = overview.assignedVehicles + overview.inTripVehicles;

  const utilizationRate =
    overview.totalVehicles > 0
      ? Number(((activeVehicles / overview.totalVehicles) * 100).toFixed(2))
      : 0;

  return {
    totalVehicles: overview.totalVehicles,
    activeVehicles,
    utilizationRate,
  };
}

export async function getMaintenanceReport(organizationId: string) {
  return reportingRepository.getMaintenanceReport(organizationId);
}

export async function getInspectionReport(organizationId: string) {
  return reportingRepository.getInspectionReport(organizationId);
}

export async function getAssignmentReport(organizationId: string) {
  return reportingRepository.getAssignmentReport(organizationId);
}

export async function getVehicleDashboard(
  organizationId: string,
): Promise<VehicleDashboardReport> {
  const [
    overview,
    status,
    types,
    utilization,
    maintenance,
    inspections,
    assignments,
  ] = await Promise.all([
    getVehicleOverview(organizationId),
    getVehicleStatusReport(organizationId),
    getVehicleTypeReport(organizationId),
    getVehicleUtilization(organizationId),
    getMaintenanceReport(organizationId),
    getInspectionReport(organizationId),
    getAssignmentReport(organizationId),
  ]);

  return {
    overview,
    status,
    types,
    utilization,
    maintenance,
    inspections,
    assignments,
    generatedAt: new Date().toISOString(),
  };
}
