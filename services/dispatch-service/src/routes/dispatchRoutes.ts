import type { FastifyInstance } from "fastify";

import { dispatchController } from "../controllers/dispatchController.js";
import { allowRoles, authenticate } from "../plugins/authPlugin.js";

export async function dispatchRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  // Read operations
  app.get("/", dispatchController.list);
  app.get("/:id", dispatchController.getById);

  // Management operations
  app.post(
    "/",
    {
      preHandler: allowRoles("admin", "manager"),
    },
    dispatchController.create,
  );

  app.patch(
    "/:id",
    {
      preHandler: allowRoles("admin", "manager"),
    },
    dispatchController.update,
  );

  app.post(
    "/:id/assign",
    {
      preHandler: allowRoles("admin", "manager"),
    },
    dispatchController.assign,
  );

  app.post(
    "/:id/dispatch",
    {
      preHandler: allowRoles("admin", "manager"),
    },
    dispatchController.markDispatched,
  );

  app.post(
    "/:id/start",
    {
      preHandler: allowRoles("admin", "manager"),
    },
    dispatchController.start,
  );

  app.post(
    "/:id/complete",
    {
      preHandler: allowRoles("admin", "manager"),
    },
    dispatchController.complete,
  );

  app.post(
    "/:id/cancel",
    {
      preHandler: allowRoles("admin", "manager"),
    },
    dispatchController.cancel,
  );
}
