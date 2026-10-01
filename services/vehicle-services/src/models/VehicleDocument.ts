import mongoose, { Document, Schema } from "mongoose";

export type VehicleDocumentType =
  | "registration"
  | "insurance"
  | "road_permit"
  | "fitness"
  | "inspection"
  | "pollution"
  | "other";

export type VehicleDocumentStatus = "valid" | "expiring" | "expired";

export interface IVehicleDocument extends Document {
  vehicleId: string;
  organizationId: string;
  documentType: VehicleDocumentType;
  title: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  fileUrl?: string;
  status: VehicleDocumentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleDocumentSchema = new Schema<IVehicleDocument>(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },

    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    documentType: {
      type: String,
      enum: [
        "registration",
        "insurance",
        "road_permit",
        "fitness",
        "inspection",
        "pollution",
        "other",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    documentNumber: {
      type: String,
      trim: true,
    },

    issueDate: Date,

    expiryDate: {
      type: Date,
      index: true,
    },

    fileUrl: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["valid", "expiring", "expired"],
      default: "valid",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const VehicleDocument = mongoose.model<IVehicleDocument>(
  "VehicleDocument",
  vehicleDocumentSchema,
);
