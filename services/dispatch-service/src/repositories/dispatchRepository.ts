import { ObjectId } from "mongodb";

import {
  getDispatchCollection,
  toDispatchId,
  type DispatchDocument,
} from "../models/dispatchModel.js";

import type { DispatchFilters, DispatchStatus } from "../types/dispatch.js";

type NewDispatch = {
  organizationId: string;
  tripId: string;
  vehicleId: string | null;
  driverId: string | null;
  assignmentId: string | null;
  status: DispatchStatus;
  scheduledAt: Date | null;
  dispatchedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  cancellationReason: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export const dispatchRepository = {
  async create(input: NewDispatch): Promise<DispatchDocument> {
    const collection = getDispatchCollection();

    const document = {
      ...input,
      _id: new ObjectId(),
    } satisfies DispatchDocument;

    await collection.insertOne(document);

    return document;
  },

  async findById(
    id: string,
    organizationId: string,
  ): Promise<DispatchDocument | null> {
    const objectId = toDispatchId(id);

    if (!objectId) return null;

    return collectionFindById(objectId, organizationId);
  },

  async findByTripId(
    tripId: string,
    organizationId: string,
  ): Promise<DispatchDocument | null> {
    return getDispatchCollection().findOne({
      tripId,
      organizationId,
    });
  },

  async list(
    filters: DispatchFilters,
    organizationId: string,
  ): Promise<{ data: DispatchDocument[]; total: number }> {
    const collection = getDispatchCollection();

    const query = {
      organizationId,
      ...(filters.status && { status: filters.status }),
      ...(filters.tripId && { tripId: filters.tripId }),
      ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
      ...(filters.driverId && { driverId: filters.driverId }),
    };

    const [data, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .toArray(),

      collection.countDocuments(query),
    ]);

    return { data, total };
  },

  async update(
    id: string,
    organizationId: string,
    changes: Partial<DispatchDocument>,
  ): Promise<DispatchDocument | null> {
    const objectId = toDispatchId(id);

    if (!objectId) return null;

    const {
      _id: _ignoredId,
      organizationId: _ignoredOrganization,
      createdBy: _ignoredCreator,
      createdAt: _ignoredCreatedAt,
      ...safeChanges
    } = changes;

    return getDispatchCollection().findOneAndUpdate(
      {
        _id: objectId,
        organizationId,
      },
      {
        $set: {
          ...safeChanges,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      },
    );
  },

  async updateStatus(
    id: string,
    organizationId: string,
    status: DispatchStatus,
    extra: Partial<DispatchDocument> = {},
  ): Promise<DispatchDocument | null> {
    return this.update(id, organizationId, {
      ...extra,
      status,
    });
  },

  async delete(id: string, organizationId: string): Promise<boolean> {
    const objectId = toDispatchId(id);

    if (!objectId) return false;

    const result = await getDispatchCollection().deleteOne({
      _id: objectId,
      organizationId,
    });

    return result.deletedCount === 1;
  },
};

async function collectionFindById(
  objectId: ObjectId,
  organizationId: string,
): Promise<DispatchDocument | null> {
  return getDispatchCollection().findOne({
    _id: objectId,
    organizationId,
  });
}
