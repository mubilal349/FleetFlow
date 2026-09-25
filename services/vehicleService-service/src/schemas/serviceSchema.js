"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listServicesQuerySchema = exports.serviceIdParamsSchema = exports.updateServiceSchema = exports.createServiceSchema = void 0;
var zod_1 = require("zod");
var serviceTypes = [
    "routine_service",
    "oil_change",
    "tire_change",
    "brake_service",
    "engine_repair",
    "inspection",
    "other",
];
var serviceStatuses = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
];
/**
 * Create vehicle service record
 */
exports.createServiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        vehicleId: zod_1.z.string().trim().min(1, "Vehicle ID is required"),
        serviceType: zod_1.z.enum(serviceTypes, {
            message: "Invalid service type",
        }),
        serviceDate: zod_1.z.coerce.date({
            message: "Valid service date is required",
        }),
        nextServiceDate: zod_1.z.coerce.date().optional(),
        mileage: zod_1.z.number().min(0, "Mileage cannot be negative"),
        cost: zod_1.z.number().min(0, "Cost cannot be negative"),
        serviceProvider: zod_1.z
            .string()
            .trim()
            .max(200, "Service provider cannot exceed 200 characters")
            .optional(),
        notes: zod_1.z
            .string()
            .trim()
            .max(5000, "Notes cannot exceed 5000 characters")
            .optional(),
        status: zod_1.z
            .enum(serviceStatuses, {
            message: "Invalid service status",
        })
            .optional(),
    }),
});
/**
 * Update vehicle service record
 */
exports.updateServiceSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().trim().min(1, "Service ID is required"),
    }),
    body: zod_1.z.object({
        vehicleId: zod_1.z
            .string()
            .trim()
            .min(1, "Vehicle ID cannot be empty")
            .optional(),
        serviceType: zod_1.z
            .enum(serviceTypes, {
            message: "Invalid service type",
        })
            .optional(),
        serviceDate: zod_1.z.coerce.date().optional(),
        nextServiceDate: zod_1.z.coerce.date().optional(),
        mileage: zod_1.z.number().min(0, "Mileage cannot be negative").optional(),
        cost: zod_1.z.number().min(0, "Cost cannot be negative").optional(),
        serviceProvider: zod_1.z
            .string()
            .trim()
            .max(200, "Service provider cannot exceed 200 characters")
            .optional(),
        notes: zod_1.z
            .string()
            .trim()
            .max(5000, "Notes cannot exceed 5000 characters")
            .optional(),
        status: zod_1.z
            .enum(serviceStatuses, {
            message: "Invalid service status",
        })
            .optional(),
    }),
});
/**
 * Get single service record
 */
exports.serviceIdParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().trim().min(1, "Service ID is required"),
    }),
});
/**
 * List/filter service records
 */
exports.listServicesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        vehicleId: zod_1.z.string().trim().optional(),
        serviceType: zod_1.z
            .enum(serviceTypes, {
            message: "Invalid service type",
        })
            .optional(),
        status: zod_1.z
            .enum(serviceStatuses, {
            message: "Invalid service status",
        })
            .optional(),
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    }),
});
