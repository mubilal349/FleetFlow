import type { FastifyInstance } from "fastify";
import {
  cancelTripHandler,
  completeTripHandler,
  createTripHandler,
  deleteTripHandler,
  getTripHandler,
  listTripsHandler,
  startTripHandler,
  tripsByDriverHandler,
  tripsByVehicleHandler,
  updateTripHandler,
} from "../controllers/tripController.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware.js";

export async function tripRoutes(app: FastifyInstance) {
  const adminManager = authorizeRoles("admin", "manager");
  const tripReaders = authorizeRoles("admin", "manager", "driver");
  const tripStarters = authorizeRoles("admin", "manager", "driver");

  app.post(
    "/",
    { preHandler: [authenticate, adminManager] },
    createTripHandler,
  );

  app.get("/", { preHandler: [authenticate, tripReaders] }, listTripsHandler);

  app.get(
    "/driver/:driverId",
    { preHandler: [authenticate, tripReaders] },
    tripsByDriverHandler,
  );

  app.get(
    "/vehicle/:vehicleId",
    { preHandler: [authenticate, adminManager] },
    tripsByVehicleHandler,
  );

  app.patch(
    "/:id/start",
    { preHandler: [authenticate, tripStarters] },
    startTripHandler,
  );

  app.patch(
    "/:id/complete",
    { preHandler: [authenticate, tripStarters] },
    completeTripHandler,
  );

  app.patch(
    "/:id/cancel",
    { preHandler: [authenticate, adminManager] },
    cancelTripHandler,
  );

  app.patch(
    "/:id",
    { preHandler: [authenticate, adminManager] },
    updateTripHandler,
  );

  app.delete(
    "/:id",
    { preHandler: [authenticate, adminManager] },
    deleteTripHandler,
  );

  app.get("/:id", { preHandler: [authenticate, tripReaders] }, getTripHandler);
}
