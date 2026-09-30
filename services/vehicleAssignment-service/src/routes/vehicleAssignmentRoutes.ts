import type { FastifyInstance } from "fastify";

import { authenticate, authorize } from "../middleware/authMiddleware.js";

import {
  cancelVehicleAssignmentController,
  completeVehicleAssignmentController,
  createVehicleAssignmentController,
  getAssignmentHistoryController,
  getDriverAssignmentHistoryController,
  getVehicleAssignmentController,
  getVehicleAssignmentHistoryController,
  getVehicleAssignmentsController,
} from "../controllers/vehicleAssignmentController.js";

export async function vehicleAssignmentRoutes(app: FastifyInstance) {
  // Create a vehicle assignment
  // Admin and Manager only
  app.post(
    "/assignments",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    createVehicleAssignmentController,
  );

  // Get all vehicle assignments
  // All authenticated users
  app.get(
    "/assignments",
    {
      preHandler: [authenticate],
    },
    getVehicleAssignmentsController,
  );

  // Get assignment history
  // Completed and cancelled assignments
  // All authenticated users
  //
  // Keep this BEFORE /assignments/:id
  // because "history" could otherwise be treated as an assignment ID.
  app.get(
    "/assignments/history",
    {
      preHandler: [authenticate],
    },
    getAssignmentHistoryController,
  );

  // Get vehicle assignment history by vehicle
  // All authenticated users
  //
  // Keep this BEFORE /assignments/:id
  // because this is a more specific route.
  app.get(
    "/assignments/vehicle/:vehicleId",
    {
      preHandler: [authenticate],
    },
    getVehicleAssignmentHistoryController,
  );

  // Get vehicle assignment history by driver
  // All authenticated users
  //
  // Keep this BEFORE /assignments/:id
  // because this is a more specific route.
  app.get(
    "/assignments/driver/:driverId",
    {
      preHandler: [authenticate],
    },
    getDriverAssignmentHistoryController,
  );

  // Get a single vehicle assignment
  // All authenticated users
  app.get(
    "/assignments/:id",
    {
      preHandler: [authenticate],
    },
    getVehicleAssignmentController,
  );

  // Complete a vehicle assignment
  // Admin and Manager only
  app.patch(
    "/assignments/:id/complete",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    completeVehicleAssignmentController,
  );

  // Cancel a vehicle assignment
  // Admin and Manager only
  app.patch(
    "/assignments/:id/cancel",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    cancelVehicleAssignmentController,
  );
}
