import type { FastifyInstance } from "fastify";

import {
  cancelVehicleRequestController,
  createVehicleRequestController,
  getCustomerRequestController,
  getCustomerRequestsController,
} from "../controllers/vehicleRequestController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";

export async function vehicleRequestRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // ==============================
  // CUSTOMER REQUESTS
  // ==============================

  fastify.post(
    "/vehicle-requests",
    {
      preHandler: requireRoles("customer"),
    },
    createVehicleRequestController,
  );

  fastify.get(
    "/vehicle-requests",
    {
      preHandler: requireRoles("customer"),
    },
    getCustomerRequestsController,
  );

  fastify.get(
    "/vehicle-requests/:id",
    {
      preHandler: requireRoles("customer"),
    },
    getCustomerRequestController,
  );

  fastify.patch(
    "/vehicle-requests/:id/cancel",
    {
      preHandler: requireRoles("customer"),
    },
    cancelVehicleRequestController,
  );
}
