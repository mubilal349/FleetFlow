import type { FastifyInstance } from "fastify";

import {
  cancelVehicleInspectionController,
  completeVehicleInspectionController,
  createVehicleInspectionController,
  deleteVehicleInspectionController,
  getVehicleInspectionController,
  getVehicleInspectionHistoryController,
  getVehicleInspectionsController,
  updateVehicleInspectionController,
} from "../controllers/vehicleInspectionController.js";

import { authenticate, authorize } from "../middleware/authMiddleware.js";

type ListInspectionsQuery = {
  page?: string;
  limit?: string;
  vehicleId?: string;
  inspectorId?: string;
  status?: string;
  overallResult?: string;
  inspectionType?: string;
};

type InspectionIdParams = {
  id: string;
};

type VehicleHistoryParams = {
  vehicleId: string;
};

type CancelInspectionBody = {
  notes?: string;
};

export async function vehicleInspectionRoutes(app: FastifyInstance) {
  /**
   * Create vehicle inspection
   *
   * POST /inspections
   *
   * Allowed roles:
   * - admin
   * - manager
   */
  app.post<{
    Body: unknown;
  }>(
    "/inspections",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    createVehicleInspectionController,
  );

  /**
   * Get vehicle inspections
   *
   * GET /inspections
   *
   * Query parameters:
   * - page
   * - limit
   * - vehicleId
   * - inspectorId
   * - status
   * - overallResult
   * - inspectionType
   */
  app.get<{
    Querystring: ListInspectionsQuery;
  }>(
    "/inspections",
    {
      preHandler: [authenticate],
    },
    getVehicleInspectionsController,
  );

  /**
   * Get inspection by ID
   *
   * GET /inspections/:id
   */
  app.get<{
    Params: InspectionIdParams;
  }>(
    "/inspections/:id",
    {
      preHandler: [authenticate],
    },
    getVehicleInspectionController,
  );

  /**
   * Get inspection history for vehicle
   *
   * GET /inspections/vehicle/:vehicleId
   */
  app.get<{
    Params: VehicleHistoryParams;
  }>(
    "/inspections/vehicle/:vehicleId",
    {
      preHandler: [authenticate],
    },
    getVehicleInspectionHistoryController,
  );

  /**
   * Update inspection
   *
   * PATCH /inspections/:id
   *
   * Allowed roles:
   * - admin
   * - manager
   */
  app.patch<{
    Params: InspectionIdParams;
    Body: unknown;
  }>(
    "/inspections/:id",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    updateVehicleInspectionController,
  );

  /**
   * Complete inspection
   *
   * PATCH /inspections/:id/complete
   *
   * Allowed roles:
   * - admin
   * - manager
   */
  app.patch<{
    Params: InspectionIdParams;
  }>(
    "/inspections/:id/complete",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    completeVehicleInspectionController,
  );

  /**
   * Cancel inspection
   *
   * PATCH /inspections/:id/cancel
   *
   * Allowed roles:
   * - admin
   * - manager
   */
  app.patch<{
    Params: InspectionIdParams;
    Body: CancelInspectionBody;
  }>(
    "/inspections/:id/cancel",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    cancelVehicleInspectionController,
  );

  /**
   * Delete inspection
   *
   * DELETE /inspections/:id
   *
   * Allowed roles:
   * - admin
   * - manager
   */
  app.delete<{
    Params: InspectionIdParams;
  }>(
    "/inspections/:id",
    {
      preHandler: [authenticate, authorize("admin", "manager")],
    },
    deleteVehicleInspectionController,
  );
}
