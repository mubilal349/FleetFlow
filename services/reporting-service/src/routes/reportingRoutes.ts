import { FastifyInstance } from "fastify";

import {
  getAssignmentReportController,
  getInspectionReportController,
  getMaintenanceReportController,
  getVehicleDashboardController,
  getVehicleOverviewController,
  getVehicleStatusController,
  getVehicleTypesController,
  getVehicleUtilizationController,
} from "../controllers/reportingController.js";

export default async function reportingRoutes(app: FastifyInstance) {
  app.get("/reports/vehicles/dashboard", getVehicleDashboardController);

  app.get("/reports/vehicles/overview", getVehicleOverviewController);

  app.get("/reports/vehicles/status", getVehicleStatusController);

  app.get("/reports/vehicles/types", getVehicleTypesController);

  app.get("/reports/vehicles/utilization", getVehicleUtilizationController);

  app.get("/reports/vehicles/maintenance", getMaintenanceReportController);

  app.get("/reports/vehicles/inspections", getInspectionReportController);

  app.get("/reports/vehicles/assignments", getAssignmentReportController);
}
