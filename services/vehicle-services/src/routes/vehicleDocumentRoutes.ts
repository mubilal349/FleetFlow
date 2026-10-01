import type { FastifyInstance } from "fastify";

import {
  createDocument,
  listDocuments,
  removeDocument,
} from "../controllers/vehicleDocumentController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRoles } from "../middleware/roleMiddleware.js";

export default async function vehicleDocumentRoutes(app: FastifyInstance) {
  // All vehicle document routes require authentication
  app.addHook("preHandler", authenticate);

  // ==============================
  // VIEW VEHICLE DOCUMENTS
  // ==============================

  app.get(
    "/vehicles/:vehicleId/documents",
    {
      preHandler: requireRoles("admin", "manager", "driver", "customer"),
    },
    listDocuments,
  );

  // ==============================
  // CREATE VEHICLE DOCUMENT
  // ==============================

  app.post(
    "/vehicles/documents",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    createDocument,
  );

  // ==============================
  // DELETE VEHICLE DOCUMENT
  // ==============================

  app.delete(
    "/vehicles/documents/:documentId",
    {
      preHandler: requireRoles("admin", "manager"),
    },
    removeDocument,
  );
}
