import type { FastifyReply, FastifyRequest } from "fastify";

import {
  createServiceSchema,
  listServicesQuerySchema,
  serviceIdParamsSchema,
  updateServiceSchema,
} from "../schemas/serviceSchema.js";

import {
  serviceService,
  ServiceServiceError,
} from "../services/serviceService.js";

class ServiceController {
  /**
   * Create service record
   * POST /services
   */
  async createService(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = createServiceSchema.safeParse({
        body: request.body,
      });

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const body = result.data.body;

      const authenticatedRequest = request as FastifyRequest & {
        user?: {
          id?: string;
          email?: string;
          role?: string;
          organizationId?: string;
        };
      };

      const createdBy = authenticatedRequest.user?.id;

      console.log("CREATE SERVICE - AUTH USER:", authenticatedRequest.user);
      console.log("CREATE SERVICE - CREATED BY:", createdBy);

      if (!createdBy) {
        return reply.status(400).send({
          success: false,
          message: "Created by user ID is required",
        });
      }

      const service = await serviceService.createService({
        ...body,
        createdBy,
      });

      return reply.status(201).send({
        success: true,
        message: "Vehicle service record created successfully",
        data: service,
      });
    } catch (error) {
      if (error instanceof ServiceServiceError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      request.log.error(error);

      return reply.status(500).send({
        success: false,
        message: "Failed to create service record",
      });
    }
  }

  /**
   * Get all service records
   * GET /services
   */
  async getServices(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = listServicesQuerySchema.safeParse({
        query: request.query,
      });

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: "Invalid query parameters",
          errors: result.error.flatten(),
        });
      }

      const services = await serviceService.getServices(result.data.query);

      return reply.status(200).send({
        success: true,
        message: "Service records fetched successfully",
        data: services,
      });
    } catch (error) {
      request.log.error(error);

      return reply.status(500).send({
        success: false,
        message: "Failed to fetch service records",
      });
    }
  }

  /**
   * Get one service record
   * GET /services/:id
   */
  async getServiceById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = serviceIdParamsSchema.safeParse({
        params: request.params,
      });

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: "Invalid service ID",
          errors: result.error.flatten(),
        });
      }

      const service = await serviceService.getServiceById(
        result.data.params.id,
      );

      return reply.status(200).send({
        success: true,
        message: "Service record fetched successfully",
        data: service,
      });
    } catch (error) {
      if (error instanceof ServiceServiceError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      request.log.error(error);

      return reply.status(500).send({
        success: false,
        message: "Failed to fetch service record",
      });
    }
  }

  /**
   * Update service record
   * PATCH /services/:id
   */
  async updateService(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = updateServiceSchema.safeParse({
        params: request.params,
        body: request.body,
      });

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const updatedService = await serviceService.updateService(
        result.data.params.id,
        result.data.body,
      );

      return reply.status(200).send({
        success: true,
        message: "Vehicle service record updated successfully",
        data: updatedService,
      });
    } catch (error) {
      if (error instanceof ServiceServiceError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      request.log.error(error);

      return reply.status(500).send({
        success: false,
        message: "Failed to update service record",
      });
    }
  }

  /**
   * Delete service record
   * DELETE /services/:id
   */
  async deleteService(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = serviceIdParamsSchema.safeParse({
        params: request.params,
      });

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          message: "Invalid service ID",
          errors: result.error.flatten(),
        });
      }

      await serviceService.deleteService(result.data.params.id);

      return reply.status(200).send({
        success: true,
        message: "Vehicle service record deleted successfully",
      });
    } catch (error) {
      if (error instanceof ServiceServiceError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      request.log.error(error);

      return reply.status(500).send({
        success: false,
        message: "Failed to delete service record",
      });
    }
  }
}

export const serviceController = new ServiceController();
