import mongoose, { Schema, Document } from "mongoose";

export type AssignmentStatus = "active" | "completed" | "cancelled";

export interface IVehicleAssignment extends Document {
  organizationId: string;
  vehicleId: string;
  driverId: string;
  assignedBy: string;

  assignedAt: Date;
  expectedReturnDate?: Date | null;
  returnedAt?: Date | null;

  status: AssignmentStatus;

  startingMileage: number;
  endingMileage?: number | null;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const vehicleAssignmentSchema = new Schema<IVehicleAssignment>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    vehicleId: {
      type: String,
      required: true,
      index: true,
    },

    driverId: {
      type: String,
      required: true,
      index: true,
    },

    assignedBy: {
      type: String,
      required: true,
    },

    assignedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expectedReturnDate: {
      type: Date,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },

    startingMileage: {
      type: Number,
      required: true,
      min: 0,
    },

    endingMileage: {
      type: Number,
      default: null,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

vehicleAssignmentSchema.index({
  organizationId: 1,
  vehicleId: 1,
  status: 1,
});

vehicleAssignmentSchema.index({
  organizationId: 1,
  driverId: 1,
  status: 1,
});

const VehicleAssignment =
  mongoose.models.VehicleAssignment ||
  mongoose.model<IVehicleAssignment>(
    "VehicleAssignment",
    vehicleAssignmentSchema,
  );

export default VehicleAssignment;
