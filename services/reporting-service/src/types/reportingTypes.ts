export interface VehicleOverview {
  totalVehicles: number;
  availableVehicles: number;
  assignedVehicles: number;
  inTripVehicles: number;
  maintenanceVehicles: number;
  inactiveVehicles: number;
}

export interface VehicleStatusReport {
  status: string;
  count: number;
}

export interface VehicleTypeReport {
  vehicleType: string;
  count: number;
}

export interface VehicleUtilizationReport {
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
}

export interface MaintenanceReport {
  totalMaintenance: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface InspectionReport {
  totalInspections: number;
  passed: number;
  failed: number;
  needsAttention: number;
  draft: number;
  cancelled: number;
}

export interface AssignmentReport {
  totalAssignments: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface VehicleDashboardReport {
  overview: VehicleOverview;
  status: VehicleStatusReport[];
  types: VehicleTypeReport[];
  utilization: VehicleUtilizationReport;
  maintenance: MaintenanceReport;
  inspections: InspectionReport;
  assignments: AssignmentReport;
  generatedAt: string;
}
