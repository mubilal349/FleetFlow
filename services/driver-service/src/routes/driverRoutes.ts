import type { FastifyInstance } from "fastify";

import {
  createDriverController,
  deleteDriverController,
  getDriverController,
  getDriversController,
  updateDriverController,
  updateDriverStatusController,
  uploadDriverProfileImageController,
} from "../controllers/driverController.js";

import type {
  DriverParams,
  DriverQuery,
  StatusBody,
} from "../controllers/driverController.js";

import type {
  CreateDriverInput,
  UpdateDriverInput,
} from "../services/driverService.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";

import {
  createDriverSchema,
  updateDriverSchema,
  updateDriverStatusSchema,
} from "../schemas/driverSchemas.js";

export async function driverRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook("preHandler", authenticate);

  fastify.get<{ Querystring: DriverQuery }>(
    "/drivers",
    {
      preHandler: requireRoles("admin", "manager", "driver", "customer"),
    },
    getDriversController,
  );

  fastify.get<{ Params: DriverParams }>(
    "/drivers/:id",
    {
      preHandler: requireRoles("admin", "manager", "driver", "customer"),
    },
    getDriverController,
  );

  fastify.post<{ Body: CreateDriverInput }>(
    "/drivers",
    {
      schema: createDriverSchema,
      preHandler: requireRoles("admin", "manager"),
    },
    createDriverController,
  );

  fastify.patch<{
    Params: DriverParams;
    Body: UpdateDriverInput;
  }>(
    "/drivers/:id",
    {
      schema: updateDriverSchema,
      preHandler: requireRoles("admin", "manager"),
    },
    updateDriverController,
  );

  fastify.post<{ Params: DriverParams }>(
    "/drivers/:id/profile-image",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    uploadDriverProfileImageController,
  );

  fastify.patch<{
    Params: DriverParams;
    Body: StatusBody;
  }>(
    "/drivers/:id/status",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    updateDriverStatusController,
  );

  fastify.delete<{ Params: DriverParams }>(
    "/drivers/:id",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    deleteDriverController,
  );
}
