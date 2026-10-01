import { VehicleDocument } from "../models/VehicleDocument.js";

function calculateStatus(expiryDate?: Date): "valid" | "expiring" | "expired" {
  if (!expiryDate) {
    return "valid";
  }

  const now = new Date();
  const expiry = new Date(expiryDate);

  if (expiry < now) {
    return "expired";
  }

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  if (expiry.getTime() - now.getTime() <= thirtyDays) {
    return "expiring";
  }

  return "valid";
}

export async function createVehicleDocument(data: {
  vehicleId: string;
  organizationId: string;
  documentType: string;
  title: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  fileUrl?: string;
  notes?: string;
}) {
  const status = calculateStatus(data.expiryDate);

  return VehicleDocument.create({
    ...data,
    status,
  });
}

export async function getVehicleDocuments(
  vehicleId: string,
  organizationId: string,
) {
  return VehicleDocument.find({
    vehicleId,
    organizationId,
  }).sort({
    expiryDate: 1,
  });
}

// ==========================================
// GET SINGLE VEHICLE DOCUMENT
// ==========================================

export async function getVehicleDocumentById(
  documentId: string,
  organizationId: string,
) {
  return VehicleDocument.findOne({
    _id: documentId,
    organizationId,
  });
}

export async function deleteVehicleDocument(
  documentId: string,
  organizationId: string,
) {
  return VehicleDocument.findOneAndDelete({
    _id: documentId,
    organizationId,
  });
}
