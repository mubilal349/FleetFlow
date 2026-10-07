import { FastifyInstance } from "fastify";

import {
  generateMaintenanceRemindersController,
  getMaintenanceAlertsController,
  updateMaintenanceAlertController,
} from "../controllers/maintenanceAlertController.js";

export default async function maintenanceAlertRoutes(app: FastifyInstance) {
  /**
   * Get all maintenance alerts.
   *
   * This also generates/updates the latest
   * maintenance reminders before returning them.
   */
  app.get("/maintenance/alerts", getMaintenanceAlertsController);

  /**
   * Manually generate maintenance reminders.
   *
   * Useful for testing and manually triggering
   * the SLA/reminder evaluation.
   */
  app.post(
    "/maintenance/alerts/generate",
    generateMaintenanceRemindersController,
  );

  /**
   * Update alert status.
   *
   * Supported:
   * - open
   * - acknowledged
   * - resolved
   */
  app.patch("/maintenance/alerts/:alertId", updateMaintenanceAlertController);
}
