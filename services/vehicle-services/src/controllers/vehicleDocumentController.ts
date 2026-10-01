import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createVehicleDocument,
  deleteVehicleDocument,
  getVehicleDocuments,
} from "../services/vehicleDocumentService.js";

import { generateVehicleDocumentPdf } from "../services/pdfService.js";

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

    // ==========================================
    // AUTHENTICATED USER
    // ==========================================

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

    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (!body.vehicleId || !body.documentType || !body.title) {
      return reply.code(400).send({
        message: "vehicleId, documentType and title are required",
      });
    }

    // ==========================================
    // PARSE DATES
    // ==========================================

    const issueDate = body.issueDate ? new Date(body.issueDate) : undefined;

    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : undefined;

    // ==========================================
    // VALIDATE DATES
    // ==========================================

    if (issueDate && Number.isNaN(issueDate.getTime())) {
      return reply.code(400).send({
        message: "Invalid issue date",
      });
    }

    if (expiryDate && Number.isNaN(expiryDate.getTime())) {
      return reply.code(400).send({
        message: "Invalid expiry date",
      });
    }

    if (issueDate && expiryDate && expiryDate < issueDate) {
      return reply.code(400).send({
        message: "Expiry date cannot be before issue date",
      });
    }

    // ==========================================
    // CREATE DATABASE DOCUMENT
    // ==========================================

    const document = await createVehicleDocument({
      vehicleId: body.vehicleId,
      organizationId,
      documentType: body.documentType,
      title: body.title,
      documentNumber: body.documentNumber,
      issueDate,
      expiryDate,
      fileUrl: body.fileUrl,
      notes: body.notes,
    });

    // ==========================================
    // GENERATE PDF
    // ==========================================

    const pdfUrl = await generateVehicleDocumentPdf({
      vehicleId: body.vehicleId,
      organizationId,
      documentType: body.documentType,
      title: body.title,
      documentNumber: body.documentNumber,
      issueDate,
      expiryDate,
      status: document.status,
      notes: body.notes,
    });

    // ==========================================
    // SAVE GENERATED PDF URL
    // ==========================================

    document.pdfUrl = pdfUrl;

    await document.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return reply.code(201).send({
      success: true,
      document,
    });
  } catch (error) {
    request.log.error(
      {
        error,
        body: request.body,
      },
      "Failed to create vehicle document",
    );

    return reply.code(500).send({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create vehicle document",
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

    // ==========================================
    // AUTHENTICATED USER
    // ==========================================

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

    // ==========================================
    // GET DOCUMENTS
    // ==========================================

    const documents = await getVehicleDocuments(vehicleId, organizationId);

    return reply.send({
      success: true,
      documents,
    });
  } catch (error) {
    request.log.error(error, "Failed to fetch vehicle documents");

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

    // ==========================================
    // AUTHENTICATED USER
    // ==========================================

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

    // ==========================================
    // DELETE DOCUMENT
    // ==========================================

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
    request.log.error(error, "Failed to delete vehicle document");

    return reply.code(500).send({
      message: "Failed to delete vehicle document",
    });
  }
}
