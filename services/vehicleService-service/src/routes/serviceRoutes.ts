import type { FastifyInstance } from "fastify";

import { serviceController } from "../controllers/serviceController.js";
import { authenticate } from "../middleware/authMiddleware.js";

export default async function serviceRoutes(
  app: FastifyInstance,
): Promise<void> {
  /**
   * Create service
   * POST /services
   */
  app.post(
    "/",
    {
      preHandler: authenticate,
    },
    serviceController.createService.bind(serviceController),
  );

  /**
   * Get services
   * GET /services
   */
  app.get(
    "/",
    {
      preHandler: authenticate,
    },
    serviceController.getServices.bind(serviceController),
  );

  /**
   * Get service by ID
   * GET /services/:id
   */
  app.get(
    "/:id",
    {
      preHandler: authenticate,
    },
    serviceController.getServiceById.bind(serviceController),
  );

  /**
   * Update service
   * PATCH /services/:id
   */
  app.patch(
    "/:id",
    {
      preHandler: authenticate,
    },
    serviceController.updateService.bind(serviceController),
  );

  /**
   * Delete service
   * DELETE /services/:id
   */
  app.delete(
    "/:id",
    {
      preHandler: authenticate,
    },
    serviceController.deleteService.bind(serviceController),
  );
}
