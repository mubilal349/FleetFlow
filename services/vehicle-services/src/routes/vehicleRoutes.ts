import type { FastifyInstance } from "fastify";

import {
  createVehicleController,
  deleteVehicleController,
  getVehicleController,
  getVehiclesController,
  updateVehicleController,
  updateVehicleStatusController,
} from "../controllers/vehicleController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";

export async function vehicleRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // ==============================
  // VIEW VEHICLES
  // ==============================

  fastify.get(
    "/vehicles",
    {
      preHandler: requireRoles("admin", "manager", "driver", "customer"),
    },
    getVehiclesController,
  );

  fastify.get(
    "/vehicles/:id",
    {
      preHandler: requireRoles("admin", "manager", "driver", "customer"),
    },
    getVehicleController,
  );

  // ==============================
  // CREATE VEHICLE
  // ==============================

  fastify.post(
    "/vehicles",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    createVehicleController,
  );

  // ==============================
  // UPDATE VEHICLE
  // ==============================

  fastify.patch(
    "/vehicles/:id",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    updateVehicleController,
  );

  // ==============================
  // UPDATE VEHICLE STATUS
  // ==============================

  fastify.patch(
    "/vehicles/:id/status",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    updateVehicleStatusController,
  );

  // ==============================
  // DEACTIVATE VEHICLE
  // ==============================

  fastify.delete(
    "/vehicles/:id",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    deleteVehicleController,
  );
}
