import { FastifyReply, FastifyRequest } from "fastify";

import {
  getAssignmentReport,
  getInspectionReport,
  getMaintenanceReport,
  getVehicleDashboard,
  getVehicleOverview,
  getVehicleStatusReport,
  getVehicleTypeReport,
  getVehicleUtilization,
} from "../services/reportingService.js";

function getOrganizationId(request: FastifyRequest): string {
  return request.user?.organizationId || request.user?.orgId || "org-demo-001";
}

export async function getVehicleDashboardController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const dashboard = await getVehicleDashboard(organizationId);

    return reply.send({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    request.log.error(error, "Failed to generate vehicle dashboard report");

    return reply.code(500).send({
      success: false,
      message: "Failed to generate vehicle dashboard report",
    });
  }
}

export async function getVehicleOverviewController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const overview = await getVehicleOverview(organizationId);

    return reply.send({
      success: true,
      overview,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch vehicle overview");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch vehicle overview",
    });
  }
}

export async function getVehicleStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const status = await getVehicleStatusReport(organizationId);

    return reply.send({
      success: true,
      status,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch vehicle status report");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch vehicle status report",
    });
  }
}

export async function getVehicleTypesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const types = await getVehicleTypeReport(organizationId);

    return reply.send({
      success: true,
      types,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch vehicle type report");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch vehicle type report",
    });
  }
}

export async function getVehicleUtilizationController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const utilization = await getVehicleUtilization(organizationId);

    return reply.send({
      success: true,
      utilization,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch vehicle utilization");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch vehicle utilization",
    });
  }
}

export async function getMaintenanceReportController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const maintenance = await getMaintenanceReport(organizationId);

    return reply.send({
      success: true,
      maintenance,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch maintenance report");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch maintenance report",
    });
  }
}

export async function getInspectionReportController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const inspections = await getInspectionReport(organizationId);

    return reply.send({
      success: true,
      inspections,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch inspection report");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch inspection report",
    });
  }
}

export async function getAssignmentReportController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const organizationId = getOrganizationId(request);

    const assignments = await getAssignmentReport(organizationId);

    return reply.send({
      success: true,
      assignments,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch assignment report");

    return reply.code(500).send({
      success: false,
      message: "Failed to fetch assignment report",
    });
  }
}
