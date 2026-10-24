import { z } from "zod";

export const dispatchStatusSchema = z.enum([
  "pending",
  "assigned",
  "dispatched",
  "in_progress",
  "completed",
  "cancelled",
]);

export const createDispatchSchema = z.object({
  tripId: z.string().trim().min(1, "Trip ID is required"),

  vehicleId: z.string().trim().min(1, "Vehicle ID cannot be empty").optional(),

  driverId: z.string().trim().min(1, "Driver ID cannot be empty").optional(),

  scheduledAt: z
    .string()
    .datetime({
      message: "Scheduled date must be a valid ISO datetime",
    })
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional(),
});

export const updateDispatchSchema = z
  .object({
    vehicleId: z.string().trim().min(1).optional(),

    driverId: z.string().trim().min(1).optional(),

    scheduledAt: z.string().datetime().nullable().optional(),

    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export const assignDispatchSchema = z.object({
  vehicleId: z.string().trim().min(1, "Vehicle ID is required"),
  driverId: z.string().trim().min(1, "Driver ID is required"),
});

export const cancelDispatchSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Cancellation reason must contain at least 3 characters")
    .max(500),
});

export const dispatchParamsSchema = z.object({
  id: z.string().trim().min(1, "Dispatch ID is required"),
});

export const dispatchQuerySchema = z.object({
  status: dispatchStatusSchema.optional(),
  tripId: z.string().trim().min(1).optional(),
  vehicleId: z.string().trim().min(1).optional(),
  driverId: z.string().trim().min(1).optional(),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateDispatchBody = z.infer<typeof createDispatchSchema>;

export type UpdateDispatchBody = z.infer<typeof updateDispatchSchema>;

export type AssignDispatchBody = z.infer<typeof assignDispatchSchema>;

export type CancelDispatchBody = z.infer<typeof cancelDispatchSchema>;
