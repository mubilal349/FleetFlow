import type { FastifyReply, FastifyRequest } from "fastify";

import {
  assignDispatchSchema,
  cancelDispatchSchema,
  createDispatchSchema,
  dispatchParamsSchema,
  dispatchQuerySchema,
  updateDispatchSchema,
} from "../schemas/dispatchSchema.js";

import { dispatchService, getContext } from "../services/dispatchService.js";

import { DispatchServiceError } from "../services/dispatchService.js";

function parseOrThrow<T>(
  schema: { parse: (value: unknown) => T },
  value: unknown,
): T {
  return schema.parse(value);
}

export const dispatchController = {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = parseOrThrow(createDispatchSchema, request.body);

    const dispatch = await dispatchService.create(body, getContext(request));

    return reply.code(201).send({
      success: true,
      message: "Dispatch created successfully",
      data: dispatch,
    });
  },

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = parseOrThrow(dispatchQuerySchema, request.query);

    const result = await dispatchService.list(query, getContext(request));

    return reply.send({
      success: true,
      ...result,
    });
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = parseOrThrow(dispatchParamsSchema, request.params);

    const dispatch = await dispatchService.getById(id, getContext(request));

    return reply.send({
      success: true,
      data: dispatch,
    });
  },

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = parseOrThrow(dispatchParamsSchema, request.params);

    const body = parseOrThrow(updateDispatchSchema, request.body);

    const dispatch = await dispatchService.update(
      id,
      body,
      getContext(request),
    );

    return reply.send({
      success: true,
      message: "Dispatch updated successfully",
      data: dispatch,
    });
  },

  async assign(request: FastifyRequest, reply: FastifyReply) {
    const { id } = parseOrThrow(dispatchParamsSchema, request.params);

    const body = parseOrThrow(assignDispatchSchema, request.body);

    const dispatch = await dispatchService.assign(
      id,
      body.vehicleId,
      body.driverId,
      getContext(request),
    );

    return reply.send({
      success: true,
      message: "Vehicle and driver assigned successfully",
      data: dispatch,
    });
  },

  async markDispatched(request: FastifyRequest, reply: FastifyReply) {
    const { id } = parseOrThrow(dispatchParamsSchema, request.params);

    const dispatch = await dispatchService.transition(
      id,
      "dispatched",
      getContext(request),
    );

    return reply.send({
      success: true,
      message: "Dispatch marked as dispatched",
      data: dispatch,
    });
  },

  async start(request: FastifyRequest, reply: FastifyReply) {
    const { id } = parseOrThrow(dispatchParamsSchema, request.params);

    const dispatch = await dispatchService.transition(
      id,
      "in_progress",
      getContext(request),
    );

    return reply.send({
      success: true,
      message: "Dispatch execution started",
      data: dispatch,
    });
  },

  async complete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = parseOrThrow(dispatchParamsSchema, request.params);

    const dispatch = await dispatchService.transition(
      id,
      "completed",
      getContext(request),
    );

    return reply.send({
      success: true,
      message: "Dispatch completed",
      data: dispatch,
    });
  },

  async cancel(request: FastifyRequest, reply: FastifyReply) {
    const { id } = parseOrThrow(dispatchParamsSchema, request.params);

    const body = parseOrThrow(cancelDispatchSchema, request.body);

    const dispatch = await dispatchService.cancel(
      id,
      body.reason,
      getContext(request),
    );

    return reply.send({
      success: true,
      message: "Dispatch cancelled",
      data: dispatch,
    });
  },
};
