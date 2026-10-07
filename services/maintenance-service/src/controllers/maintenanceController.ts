import { FastifyReply, FastifyRequest } from "fastify";
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenanceById,
  getMaintenances,
  updateMaintenance,
} from "../services/maintenanceService.js";

interface MaintenanceParams {
  maintenanceId: string;
}

interface MaintenanceBody {
  vehicleId?: string;
  serviceType?: string;
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  status?: "scheduled" | "in_progress" | "completed" | "overdue";
  priority?: "low" | "medium" | "high" | "critical";
  reminderDays?: number;
  notes?: string;
}

function getOrganizationId(request: FastifyRequest): string {
  const user = request.user;

  return user?.organizationId || user?.orgId || "org-demo-001";
}

export async function createMaintenanceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body as MaintenanceBody;

    if (!body.vehicleId) {
      return reply.code(400).send({
        success: false,
        message: "vehicleId is required",
      });
    }

    if (!body.serviceType) {
      return reply.code(400).send({
        success: false,
        message: "serviceType is required",
      });
    }

    if (!body.scheduledDate) {
      return reply.code(400).send({
        success: false,
        message: "scheduledDate is required",
      });
    }

    const scheduledDate = new Date(body.scheduledDate);

    if (Number.isNaN(scheduledDate.getTime())) {
      return reply.code(400).send({
        success: false,
        message: "Invalid scheduledDate",
      });
    }

    let completedDate: Date | undefined;

    if (body.completedDate) {
      completedDate = new Date(body.completedDate);

      if (Number.isNaN(completedDate.getTime())) {
        return reply.code(400).send({
          success: false,
          message: "Invalid completedDate",
        });
      }
    }

    const organizationId = getOrganizationId(request);

    const maintenance = await createMaintenance({
      vehicleId: body.vehicleId,
      organizationId,
      serviceType: body.serviceType,
      description: body.description,
      scheduledDate,
      completedDate,
      status: body.status || "scheduled",
      priority: body.priority || "medium",
      reminderDays: body.reminderDays ?? 7,
      notes: body.notes,
    });

    return reply.code(201).send({
      success: true,
      message: "Maintenance record created successfully",
      maintenance,
    });
  } catch (error) {
    request.log.error(error, "Failed to create maintenance record");

    return reply.code(500).send({
      success: false,
      message: "Failed to create maintenance record",
    });
  }
}

export async function getMaintenancesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    request.log.info({ organizationId }, "Fetching maintenance records");

    const maintenances = await getMaintenances(organizationId);

    return reply.send({
      success: true,
      count: maintenances.length,
      maintenances,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch maintenance records");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch maintenance records",
    });
  }
}

export async function getMaintenanceByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { maintenanceId } = request.params as MaintenanceParams;

    const organizationId = getOrganizationId(request);

    const maintenance = await getMaintenanceById(maintenanceId, organizationId);

    if (!maintenance) {
      return reply.code(404).send({
        success: false,
        message: "Maintenance record not found",
      });
    }

    return reply.send({
      success: true,
      maintenance,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch maintenance record");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch maintenance record",
    });
  }
}

export async function updateMaintenanceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { maintenanceId } = request.params as MaintenanceParams;

    const body = request.body as MaintenanceBody;

    const organizationId = getOrganizationId(request);

    const updateData: Record<string, unknown> = {};

    if (body.serviceType !== undefined) {
      updateData.serviceType = body.serviceType;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.scheduledDate !== undefined) {
      const scheduledDate = new Date(body.scheduledDate);

      if (Number.isNaN(scheduledDate.getTime())) {
        return reply.code(400).send({
          success: false,
          message: "Invalid scheduledDate",
        });
      }

      updateData.scheduledDate = scheduledDate;
    }

    if (body.completedDate !== undefined) {
      const completedDate = new Date(body.completedDate);

      if (Number.isNaN(completedDate.getTime())) {
        return reply.code(400).send({
          success: false,
          message: "Invalid completedDate",
        });
      }

      updateData.completedDate = completedDate;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }

    if (body.reminderDays !== undefined) {
      updateData.reminderDays = body.reminderDays;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const maintenance = await updateMaintenance(
      maintenanceId,
      organizationId,
      updateData,
    );

    if (!maintenance) {
      return reply.code(404).send({
        success: false,
        message: "Maintenance record not found",
      });
    }

    return reply.send({
      success: true,
      message: "Maintenance record updated successfully",
      maintenance,
    });
  } catch (error) {
    request.log.error(error, "Failed to update maintenance record");

    return reply.code(500).send({
      success: false,
      message: "Failed to update maintenance record",
    });
  }
}

export async function deleteMaintenanceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { maintenanceId } = request.params as MaintenanceParams;

    const organizationId = getOrganizationId(request);

    const maintenance = await deleteMaintenance(maintenanceId, organizationId);

    if (!maintenance) {
      return reply.code(404).send({
        success: false,
        message: "Maintenance record not found",
      });
    }

    return reply.send({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    request.log.error(error, "Failed to delete maintenance record");

    return reply.code(500).send({
      success: false,
      message: "Failed to delete maintenance record",
    });
  }
}
