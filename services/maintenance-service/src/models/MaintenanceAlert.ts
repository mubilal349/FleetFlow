import mongoose, { Document, Schema } from "mongoose";

export interface IMaintenanceAlert extends Document {
  vehicleId: string;
  maintenanceId: string;
  organizationId: string;

  severity: "critical" | "warning" | "upcoming";

  title: string;
  message: string;

  dueDate: Date;

  status: "open" | "acknowledged" | "resolved";

  createdAt: Date;
  updatedAt: Date;
}

const maintenanceAlertSchema = new Schema<IMaintenanceAlert>(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },

    maintenanceId: {
      type: String,
      required: true,
      index: true,
    },

    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["critical", "warning", "upcoming"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

export const MaintenanceAlert = mongoose.model<IMaintenanceAlert>(
  "MaintenanceAlert",
  maintenanceAlertSchema,
);
