import { FastifyReply, FastifyRequest } from "fastify";

import {
  getMaintenanceAlerts,
  updateMaintenanceAlertStatus,
} from "../services/maintenanceAlertService.js";

interface AlertParams {
  alertId: string;
}

interface AlertBody {
  status: "open" | "acknowledged" | "resolved";
}

function getOrganizationId(request: FastifyRequest): string {
  return request.user?.organizationId || request.user?.orgId || "org-demo-001";
}

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
