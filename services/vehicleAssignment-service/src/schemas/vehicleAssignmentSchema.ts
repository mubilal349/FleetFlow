import { z } from "zod";

export const createVehicleAssignmentSchema = z.object({
  vehicleId: z.string().trim().min(1, "Vehicle ID is required."),

  driverId: z.string().trim().min(1, "Driver ID is required."),

  expectedReturnDate: z.string().datetime().optional().nullable(),

  startingMileage: z.number().min(0, "Starting mileage cannot be negative."),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5000 characters.")
    .optional(),
});

export const completeVehicleAssignmentSchema = z.object({
  endingMileage: z.number().min(0, "Ending mileage cannot be negative."),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5000 characters.")
    .optional(),
});

export const cancelVehicleAssignmentSchema = z.object({
  notes: z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5000 characters.")
    .optional(),
});

export const vehicleAssignmentIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const vehicleIdParamsSchema = z.object({
  vehicleId: z.string().trim().min(1),
});

export const driverIdParamsSchema = z.object({
  driverId: z.string().trim().min(1),
});

export const listVehicleAssignmentsQuerySchema = z.object({
  status: z.enum(["active", "completed", "cancelled"]).optional(),

  vehicleId: z.string().trim().optional(),

  driverId: z.string().trim().optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});
