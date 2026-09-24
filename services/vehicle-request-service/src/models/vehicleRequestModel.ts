import mongoose, { Schema, type Document, type Model } from "mongoose";

export type VehicleRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface VehicleRequestDocument extends Document {
  organizationId: string;
  customerId: string;
  vehicleId: string;

  purpose: string;
  pickupLocation: string;
  destination: string;

  startDate: Date;
  endDate: Date;

  notes?: string;

  status: VehicleRequestStatus;

  rejectionReason?: string;

  reviewedBy?: string;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const vehicleRequestSchema = new Schema<VehicleRequestDocument>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    customerId: {
      type: String,
      required: true,
      index: true,
    },

    vehicleId: {
      type: String,
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    reviewedBy: {
      type: String,
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

vehicleRequestSchema.index({
  organizationId: 1,
  customerId: 1,
  createdAt: -1,
});

vehicleRequestSchema.index({
  organizationId: 1,
  status: 1,
  createdAt: -1,
});

export const VehicleRequestModel: Model<VehicleRequestDocument> =
  mongoose.models.VehicleRequest ||
  mongoose.model<VehicleRequestDocument>(
    "VehicleRequest",
    vehicleRequestSchema,
  );
