import { z } from "zod";

export const createVehicleRequestSchema = z
  .object({
    vehicleId: z.string().trim().min(1),

    purpose: z
      .string()
      .trim()
      .min(3, "Purpose must be at least 3 characters.")
      .max(500),

    pickupLocation: z
      .string()
      .trim()
      .min(2, "Pickup location is required.")
      .max(500),

    destination: z.string().trim().min(2, "Destination is required.").max(500),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    notes: z.string().trim().max(2000).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

export const vehicleRequestIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const rejectVehicleRequestSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(3, "Rejection reason is required.")
    .max(1000),
});

export const listVehicleRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
});
