import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createVehicleDocument,
  deleteVehicleDocument,
  getVehicleDocuments,
} from "../services/vehicleDocumentService.js";

export async function createDocument(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = request.body as {
      vehicleId: string;
      documentType: string;
      title: string;
      documentNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      fileUrl?: string;
      notes?: string;
    };

    const user = request.user as {
      orgId?: string;
      organizationId?: string;
    };

    const organizationId = user.orgId || user.organizationId;

    if (!organizationId) {
      return reply.code(400).send({
        message: "Organization ID is required",
      });
    }

    if (!body.vehicleId || !body.documentType || !body.title) {
      return reply.code(400).send({
        message: "vehicleId, documentType and title are required",
      });
    }

    const document = await createVehicleDocument({
      vehicleId: body.vehicleId,
      organizationId,
      documentType: body.documentType,
      title: body.title,
      documentNumber: body.documentNumber,
      issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      fileUrl: body.fileUrl,
      notes: body.notes,
    });

    return reply.code(201).send({
      success: true,
      document,
    });
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to create vehicle document",
    });
  }
}

export async function listDocuments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { vehicleId } = request.params as {
      vehicleId: string;
    };

    const user = request.user as {
      orgId?: string;
      organizationId?: string;
    };

    const organizationId = user.orgId || user.organizationId;

    if (!organizationId) {
      return reply.code(400).send({
        message: "Organization ID is required",
      });
    }

    const documents = await getVehicleDocuments(vehicleId, organizationId);

    return reply.send({
      success: true,
      documents,
    });
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to fetch vehicle documents",
    });
  }
}

export async function removeDocument(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { documentId } = request.params as {
      documentId: string;
    };

    const user = request.user as {
      orgId?: string;
      organizationId?: string;
    };

    const organizationId = user.orgId || user.organizationId;

    if (!organizationId) {
      return reply.code(400).send({
        message: "Organization ID is required",
      });
    }

    const document = await deleteVehicleDocument(documentId, organizationId);

    if (!document) {
      return reply.code(404).send({
        message: "Document not found",
      });
    }

    return reply.send({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Failed to delete vehicle document",
    });
  }
}
