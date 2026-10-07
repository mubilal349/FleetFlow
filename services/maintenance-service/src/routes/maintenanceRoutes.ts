import { FastifyInstance } from "fastify";

import {
  createMaintenanceController,
  deleteMaintenanceController,
  getMaintenanceByIdController,
  getMaintenancesController,
  updateMaintenanceController,
} from "../controllers/maintenanceController.js";

export default async function maintenanceRoutes(app: FastifyInstance) {
  // Create maintenance record
  app.post("/maintenance", createMaintenanceController);

  // Get all maintenance records
  app.get("/maintenance", getMaintenancesController);

  // Get maintenance record by ID
  app.get("/maintenance/:maintenanceId", getMaintenanceByIdController);

  // Update maintenance record
  app.patch("/maintenance/:maintenanceId", updateMaintenanceController);

  // Delete maintenance record
  app.delete("/maintenance/:maintenanceId", deleteMaintenanceController);
}
