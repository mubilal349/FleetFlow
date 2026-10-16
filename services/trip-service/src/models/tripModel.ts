import type { Collection } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { TripDocument } from "../types/trip.js";

export function tripCollection(): Collection<TripDocument> {
  return getDatabase().collection<TripDocument>("trips");
}
