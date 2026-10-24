export type DispatchStatus =
  | "pending"
  | "assigned"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Dispatch {
  id: string;
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

export interface CreateDispatchInput {
  tripId: string;
  vehicleId?: string;
  driverId?: string;
  scheduledAt?: string;
  notes?: string;
}

export interface UpdateDispatchInput {
  vehicleId?: string;
  driverId?: string;
  scheduledAt?: string | null;
  notes?: string | null;
}

export interface DispatchFilters {
  status?: DispatchStatus;
  tripId?: string;
  vehicleId?: string;
  driverId?: string;
  page: number;
  limit: number;
}

export interface DispatchListResult {
  data: Dispatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
