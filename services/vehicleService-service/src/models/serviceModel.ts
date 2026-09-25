import mongoose, { Document, Model, Schema } from "mongoose";

export type ServiceType =
  | "routine_service"
  | "oil_change"
  | "tire_change"
  | "brake_service"
  | "engine_repair"
  | "inspection"
  | "other";

export type ServiceStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface IService extends Document {
  vehicleId: string;
  serviceType: ServiceType;
  serviceDate: Date;
  nextServiceDate?: Date;
  mileage: number;
  cost: number;
  serviceProvider?: string;
  notes?: string;
  status: ServiceStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    vehicleId: {
      type: String,
      required: true,
      trim: true,
    },

    serviceType: {
      type: String,
      enum: [
        "routine_service",
        "oil_change",
        "tire_change",
        "brake_service",
        "engine_repair",
        "inspection",
        "other",
      ],
      required: true,
    },

    serviceDate: {
      type: Date,
      required: true,
    },

    nextServiceDate: {
      type: Date,
    },

    mileage: {
      type: Number,
      required: true,
      min: 0,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    serviceProvider: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },

    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

serviceSchema.index({ vehicleId: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ serviceDate: -1 });

const ServiceModel: Model<IService> = mongoose.model<IService>(
  "Service",
  serviceSchema,
);

export default ServiceModel;
