import { Schema, model, type Document } from "mongoose";

export const INSPECTION_TYPES = [
  "pre_trip",
  "post_trip",
  "routine",
  "safety",
  "maintenance",
  "annual",
] as const;

export const CHECKLIST_STATUSES = [
  "pass",
  "fail",
  "needs_attention",
  "not_checked",
] as const;

export const INSPECTION_RESULTS = [
  "passed",
  "failed",
  "needs_attention",
] as const;

export const INSPECTION_STATUSES = ["draft", "completed", "cancelled"] as const;

export type InspectionType = (typeof INSPECTION_TYPES)[number];

export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number];

export type InspectionResult = (typeof INSPECTION_RESULTS)[number];

export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export interface IInspectionChecklist {
  engine: ChecklistStatus;
  brakes: ChecklistStatus;
  tires: ChecklistStatus;
  lights: ChecklistStatus;
  battery: ChecklistStatus;
  fluids: ChecklistStatus;
  exterior: ChecklistStatus;
  interior: ChecklistStatus;
  safetyEquipment: ChecklistStatus;
}

export interface IVehicleInspection extends Document {
  organizationId: string;

  vehicleId: string;

  inspectorId: string;

  inspectionType: InspectionType;

  inspectionDate: Date;

  mileage: number;

  checklist: IInspectionChecklist;

  overallResult: InspectionResult;

  notes?: string;

  issues: string[];

  status: InspectionStatus;

  createdAt: Date;

  updatedAt: Date;
}

const checklistSchema = new Schema<IInspectionChecklist>(
  {
    engine: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    brakes: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    tires: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    lights: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    battery: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    fluids: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    exterior: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    interior: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },

    safetyEquipment: {
      type: String,
      enum: CHECKLIST_STATUSES,
      default: "not_checked",
    },
  },
  {
    _id: false,
  },
);

const vehicleInspectionSchema = new Schema<IVehicleInspection>(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    vehicleId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    inspectorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    inspectionType: {
      type: String,
      enum: INSPECTION_TYPES,
      required: true,
      index: true,
    },

    inspectionDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    mileage: {
      type: Number,
      required: true,
      min: 0,
    },

    checklist: {
      type: checklistSchema,
      required: true,
    },

    overallResult: {
      type: String,
      enum: INSPECTION_RESULTS,
      default: "needs_attention",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    issues: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: INSPECTION_STATUSES,
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

vehicleInspectionSchema.index({
  organizationId: 1,
  vehicleId: 1,
  inspectionDate: -1,
});

vehicleInspectionSchema.index({
  organizationId: 1,
  status: 1,
  inspectionDate: -1,
});

vehicleInspectionSchema.index({
  organizationId: 1,
  overallResult: 1,
});

export const VehicleInspection = model<IVehicleInspection>(
  "VehicleInspection",
  vehicleInspectionSchema,
);
