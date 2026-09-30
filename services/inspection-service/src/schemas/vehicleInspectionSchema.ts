import { z } from "zod";

export const inspectionTypeSchema = z.enum([
  "pre_trip",
  "post_trip",
  "routine",
  "safety",
  "maintenance",
  "annual",
]);

export const checklistStatusSchema = z.enum([
  "pass",
  "fail",
  "needs_attention",
  "not_checked",
]);

export const inspectionResultSchema = z.enum([
  "passed",
  "failed",
  "needs_attention",
]);

export const inspectionStatusSchema = z.enum([
  "draft",
  "completed",
  "cancelled",
]);

export const inspectionChecklistSchema = z.object({
  engine: checklistStatusSchema,
  brakes: checklistStatusSchema,
  tires: checklistStatusSchema,
  lights: checklistStatusSchema,
  battery: checklistStatusSchema,
  fluids: checklistStatusSchema,
  exterior: checklistStatusSchema,
  interior: checklistStatusSchema,
  safetyEquipment: checklistStatusSchema,
});

export const createVehicleInspectionSchema = z.object({
  vehicleId: z.string().trim().min(1, "Vehicle ID is required"),

  inspectorId: z.string().trim().min(1, "Inspector ID is required"),

  inspectionType: inspectionTypeSchema,

  inspectionDate: z
    .string()
    .datetime({
      offset: true,
    })
    .optional(),

  mileage: z.number().min(0, "Mileage cannot be negative"),

  checklist: inspectionChecklistSchema,

  overallResult: inspectionResultSchema.default("needs_attention"),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional(),

  issues: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
});

export const updateVehicleInspectionSchema = z
  .object({
    inspectionType: inspectionTypeSchema.optional(),

    inspectionDate: z
      .string()
      .datetime({
        offset: true,
      })
      .optional(),

    mileage: z.number().min(0, "Mileage cannot be negative").optional(),

    checklist: inspectionChecklistSchema.optional(),

    overallResult: inspectionResultSchema.optional(),

    notes: z
      .string()
      .trim()
      .max(2000, "Notes cannot exceed 2000 characters")
      .optional(),

    issues: z.array(z.string().trim().min(1).max(500)).max(50).optional(),

    status: inspectionStatusSchema.optional(),
  })
  .strict();

export type CreateVehicleInspectionInput = z.infer<
  typeof createVehicleInspectionSchema
>;

export type UpdateVehicleInspectionInput = z.infer<
  typeof updateVehicleInspectionSchema
>;
