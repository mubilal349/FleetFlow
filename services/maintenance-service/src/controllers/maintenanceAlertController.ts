import { FastifyReply, FastifyRequest } from "fastify";

import {
  getMaintenanceAlerts,
  updateMaintenanceAlertStatus,
} from "../services/maintenanceAlertService.js";

import { reminderService } from "../services/reminderService.js";

interface AlertParams {
  alertId: string;
}

interface AlertBody {
  status: "open" | "acknowledged" | "resolved";
}

function getOrganizationId(request: FastifyRequest): string {
  return request.user?.organizationId || request.user?.orgId || "org-demo-001";
}

/**
 * Get maintenance alerts.
 *
 * This also generates/updates the latest reminders
 * before returning them.
 */
export async function getMaintenanceAlertsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const alerts = await getMaintenanceAlerts(organizationId);

    return reply.send({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch maintenance alerts");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch maintenance alerts",
    });
  }
}

/**
 * Manually generate maintenance reminders.
 *
 * This endpoint is useful for:
 * - testing
 * - admin dashboard refresh
 * - manually triggering SLA checks
 */
export async function generateMaintenanceRemindersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const alerts = await reminderService.generateReminders(organizationId);

    return reply.send({
      success: true,
      message: "Maintenance reminders generated successfully",
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    request.log.error(error, "Failed to generate maintenance reminders");

    return reply.code(500).send({
      success: false,
      message: "Failed to generate maintenance reminders",
    });
  }
}

/**
 * Update maintenance alert status.
 *
 * Supported statuses:
 * - open
 * - acknowledged
 * - resolved
 */
export async function updateMaintenanceAlertController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { alertId } = request.params as AlertParams;

    const body = request.body as AlertBody;

    if (!body?.status) {
      return reply.code(400).send({
        success: false,
        message: "Alert status is required",
      });
    }

    if (!["open", "acknowledged", "resolved"].includes(body.status)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid alert status",
      });
    }

    const organizationId = getOrganizationId(request);

    const alert = await updateMaintenanceAlertStatus(
      alertId,
      organizationId,
      body.status,
    );

    if (!alert) {
      return reply.code(404).send({
        success: false,
        message: "Maintenance alert not found",
      });
    }

    return reply.send({
      success: true,
      message: "Maintenance alert updated successfully",
      alert,
    });
  } catch (error) {
    request.log.error(error, "Failed to update maintenance alert");

    return reply.code(500).send({
      success: false,
      message: "Failed to update maintenance alert",
    });
  }
}
