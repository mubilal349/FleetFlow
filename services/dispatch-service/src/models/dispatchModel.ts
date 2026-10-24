import {
  Collection,
  Db,
  Document,
  IndexDescription,
  MongoClient,
  ObjectId,
} from "mongodb";

import { env } from "../config/env.js";
import type { DispatchStatus } from "../types/dispatch.js";

export interface DispatchDocument extends Document {
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
}

let mongoClient: MongoClient | null = null;
let database: Db | null = null;

export async function connectDatabase(): Promise<void> {
  if (database) return;

  const client = new MongoClient(env.MONGODB_URI);

  await client.connect();

  const db = client.db();

  const indexes: IndexDescription[] = [
    { key: { organizationId: 1, createdAt: -1 } },
    { key: { organizationId: 1, status: 1 } },
    { key: { organizationId: 1, tripId: 1 } },
    { key: { organizationId: 1, vehicleId: 1 } },
    { key: { organizationId: 1, driverId: 1 } },
  ];

  try {
    await db.collection<DispatchDocument>("dispatches").createIndexes(indexes);

    mongoClient = client;
    database = db;
  } catch (error) {
    await client.close();
    throw error;
  }
}

export function getDispatchCollection(): Collection<DispatchDocument> {
  if (!database) {
    throw new Error("Database is not connected");
  }

  return database.collection<DispatchDocument>("dispatches");
}

export function toDispatchId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;

  const objectId = new ObjectId(id);

  return objectId.toHexString() === id.toLowerCase() ? objectId : null;
}

export async function closeDatabase(): Promise<void> {
  const client = mongoClient;

  mongoClient = null;
  database = null;

  if (client) {
    await client.close();
  }
}
