import type { FastifyInstance } from "fastify";

import {
  approveVehicleRequestController,
  cancelVehicleRequestController,
  createVehicleRequestController,
  getCustomerRequestController,
  getCustomerRequestsController,
  getOrganizationRequestsController,
  rejectVehicleRequestController,
} from "../controllers/vehicleRequestController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";

export async function vehicleRequestRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  /*
   * ============================
   * CUSTOMER
   * ============================
   */

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

  /*
   * ============================
   * ADMIN / MANAGER
   * ============================
   */

  fastify.get(
    "/vehicle-requests/admin",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    getOrganizationRequestsController,
  );

  fastify.patch(
    "/vehicle-requests/:id/approve",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    approveVehicleRequestController,
  );

  fastify.patch(
    "/vehicle-requests/:id/reject",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    rejectVehicleRequestController,
  );
}
