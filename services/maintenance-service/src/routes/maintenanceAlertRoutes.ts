import { FastifyInstance } from "fastify";

import {
  getMaintenanceAlertsController,
  updateMaintenanceAlertController,
} from "../controllers/maintenanceAlertController.js";

export default async function maintenanceAlertRoutes(app: FastifyInstance) {
  app.get("/maintenance/alerts", getMaintenanceAlertsController);

  app.patch("/maintenance/alerts/:alertId", updateMaintenanceAlertController);
}
