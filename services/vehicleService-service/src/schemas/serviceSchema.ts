import { z } from "zod";

const serviceTypes = [
  "routine_service",
  "oil_change",
  "tire_change",
  "brake_service",
  "engine_repair",
  "inspection",
  "other",
] as const;

const serviceStatuses = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

/**
 * Create vehicle service record
 */
export const createServiceSchema = z.object({
  body: z.object({
    vehicleId: z.string().trim().min(1, "Vehicle ID is required"),

    serviceType: z.enum(serviceTypes, {
      message: "Invalid service type",
    }),

    serviceDate: z.coerce.date({
      message: "Valid service date is required",
    }),

    nextServiceDate: z.coerce.date().optional(),

    mileage: z.number().min(0, "Mileage cannot be negative"),

    cost: z.number().min(0, "Cost cannot be negative"),

    serviceProvider: z
      .string()
      .trim()
      .max(200, "Service provider cannot exceed 200 characters")
      .optional(),

    notes: z
      .string()
      .trim()
      .max(5000, "Notes cannot exceed 5000 characters")
      .optional(),

    status: z
      .enum(serviceStatuses, {
        message: "Invalid service status",
      })
      .optional(),
  }),
});

/**
 * Update vehicle service record
 */
export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "Service ID is required"),
  }),

  body: z.object({
    vehicleId: z
      .string()
      .trim()
      .min(1, "Vehicle ID cannot be empty")
      .optional(),

    serviceType: z
      .enum(serviceTypes, {
        message: "Invalid service type",
      })
      .optional(),

    serviceDate: z.coerce.date().optional(),

    nextServiceDate: z.coerce.date().optional(),

    mileage: z.number().min(0, "Mileage cannot be negative").optional(),

    cost: z.number().min(0, "Cost cannot be negative").optional(),

    serviceProvider: z
      .string()
      .trim()
      .max(200, "Service provider cannot exceed 200 characters")
      .optional(),

    notes: z
      .string()
      .trim()
      .max(5000, "Notes cannot exceed 5000 characters")
      .optional(),

    status: z
      .enum(serviceStatuses, {
        message: "Invalid service status",
      })
      .optional(),
  }),
});

/**
 * Get single service record
 */
export const serviceIdParamsSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "Service ID is required"),
  }),
});

/**
 * List/filter service records
 */
export const listServicesQuerySchema = z.object({
  query: z.object({
    vehicleId: z.string().trim().optional(),

    serviceType: z
      .enum(serviceTypes, {
        message: "Invalid service type",
      })
      .optional(),

    status: z
      .enum(serviceStatuses, {
        message: "Invalid service status",
      })
      .optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
