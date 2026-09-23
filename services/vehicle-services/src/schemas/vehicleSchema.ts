import { z } from "zod";

const vehicleTypes = [
  "car",
  "van",
  "pickup",
  "truck",
  "bus",
  "motorcycle",
  "trailer",
  "other",
] as const;

const vehicleStatuses = [
  "available",
  "assigned",
  "in_trip",
  "maintenance",
  "inactive",
] as const;

const fuelTypes = [
  "petrol",
  "diesel",
  "electric",
  "hybrid",
  "cng",
  "lpg",
  "other",
] as const;

const locationSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().trim().max(500).optional(),
  })
  .optional();

const insuranceSchema = z
  .object({
    provider: z.string().trim().max(150).optional(),
    policyNumber: z.string().trim().max(100).optional(),
    expiryDate: z.coerce.date().optional(),
  })
  .optional();

export const createVehicleSchema = z.object({
  organizationId: z.string().trim().min(1),

  registrationNumber: z.string().trim().min(1).max(50),

  make: z.string().trim().min(1).max(100),

  model: z.string().trim().min(1).max(100),

  year: z.number().int().min(1900).max(2100),

  vehicleType: z.enum(vehicleTypes),

  color: z.string().trim().max(50).optional(),

  status: z.enum(vehicleStatuses).optional(),

  fuelType: z.enum(fuelTypes),

  fuelCapacity: z.number().min(0).optional(),

  currentMileage: z.number().min(0).optional(),

  driverId: z.string().trim().min(1).nullable().optional(),

  location: locationSchema,

  purchaseDate: z.coerce.date().optional(),

  purchasePrice: z.number().min(0).optional(),

  insurance: insuranceSchema,

  notes: z.string().trim().max(2000).optional(),
});

export const updateVehicleSchema = z
  .object({
    registrationNumber: z.string().trim().min(1).max(50).optional(),

    make: z.string().trim().min(1).max(100).optional(),

    model: z.string().trim().min(1).max(100).optional(),

    year: z.number().int().min(1900).max(2100).optional(),

    vehicleType: z.enum(vehicleTypes).optional(),

    color: z.string().trim().max(50).optional(),

    status: z.enum(vehicleStatuses).optional(),

    fuelType: z.enum(fuelTypes).optional(),

    fuelCapacity: z.number().min(0).optional(),

    currentMileage: z.number().min(0).optional(),

    driverId: z.string().trim().min(1).nullable().optional(),

    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().trim().max(500).optional(),
      })
      .nullable()
      .optional(),

    purchaseDate: z.coerce.date().optional(),

    purchasePrice: z.number().min(0).optional(),

    insurance: z
      .object({
        provider: z.string().trim().max(150).optional(),
        policyNumber: z.string().trim().max(100).optional(),
        expiryDate: z.coerce.date().optional(),
      })
      .nullable()
      .optional(),

    notes: z.string().trim().max(2000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const updateVehicleStatusSchema = z.object({
  status: z.enum(vehicleStatuses),
});

export const vehicleIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const listVehiclesQuerySchema = z.object({
  organizationId: z.string().trim().min(1),

  status: z.enum(vehicleStatuses).optional(),

  vehicleType: z.enum(vehicleTypes).optional(),

  driverId: z.string().trim().optional(),

  search: z.string().trim().optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

export type UpdateVehicleStatusInput = z.infer<
  typeof updateVehicleStatusSchema
>;

export type VehicleIdParams = z.infer<typeof vehicleIdParamsSchema>;

export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>;
