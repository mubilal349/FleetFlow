import { MongoClient, type Db } from "mongodb";
import { env } from "./env.js";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (database) return database;

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();

  database = client.db(env.MONGODB_DB);

  const trips = database.collection("trips");

  await trips.createIndex({ organizationId: 1, createdAt: -1 });
  await trips.createIndex({ organizationId: 1, status: 1 });
  await trips.createIndex({ organizationId: 1, driverId: 1 });
  await trips.createIndex({ organizationId: 1, vehicleId: 1 });

  return database;
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error("Database is not connected.");
  }

  return database;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}
