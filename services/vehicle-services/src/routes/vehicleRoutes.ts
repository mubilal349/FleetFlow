import type { FastifyInstance } from "fastify";

import {
  createVehicleController,
  deleteVehicleController,
  getVehicleController,
  getVehiclesController,
  updateVehicleController,
  updateVehicleStatusController,
} from "../controllers/vehicleController.js";

export async function vehicleRoutes(fastify: FastifyInstance) {
  fastify.post("/vehicles", createVehicleController);

  fastify.get("/vehicles", getVehiclesController);

  fastify.get("/vehicles/:id", getVehicleController);

  fastify.patch("/vehicles/:id", updateVehicleController);

  fastify.patch("/vehicles/:id/status", updateVehicleStatusController);

  fastify.delete("/vehicles/:id", deleteVehicleController);
}
