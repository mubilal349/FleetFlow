import mongoose, { Document, Schema } from "mongoose";

export interface IMaintenance extends Document {
  vehicleId: string;
  organizationId: string;

  serviceType: string;
  description?: string;

  scheduledDate: Date;
  completedDate?: Date;

  status: "scheduled" | "in_progress" | "completed" | "overdue";

  priority: "low" | "medium" | "high" | "critical";

  reminderDays: number;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
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

    serviceType: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },

    completedDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "overdue"],
      default: "scheduled",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    reminderDays: {
      type: Number,
      default: 7,
      min: 0,
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

export const Maintenance = mongoose.model<IMaintenance>(
  "Maintenance",
  maintenanceSchema,
);
