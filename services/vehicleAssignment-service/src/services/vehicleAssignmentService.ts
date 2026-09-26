import VehicleAssignment, {
  type AssignmentStatus,
} from "../models/vehicleAssignmentModel.js";

export class VehicleAssignmentServiceError extends Error {
  statusCode: number;
  code: string;

  constructor(
    message: string,
    statusCode = 400,
    code = "VEHICLE_ASSIGNMENT_ERROR",
  ) {
    super(message);

    this.name = "VehicleAssignmentServiceError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

interface CreateAssignmentInput {
  organizationId: string;
  vehicleId: string;
  driverId: string;
  assignedBy: string;
  expectedReturnDate?: string | null;
  startingMileage: number;
  notes?: string;
}

export async function createVehicleAssignmentService(
  input: CreateAssignmentInput,
) {
  const existingVehicleAssignment = await VehicleAssignment.findOne({
    organizationId: input.organizationId,
    vehicleId: input.vehicleId,
    status: "active",
  });

  if (existingVehicleAssignment) {
    throw new VehicleAssignmentServiceError(
      "This vehicle is already assigned.",
      409,
      "VEHICLE_ALREADY_ASSIGNED",
    );
  }

  const existingDriverAssignment = await VehicleAssignment.findOne({
    organizationId: input.organizationId,
    driverId: input.driverId,
    status: "active",
  });

  if (existingDriverAssignment) {
    throw new VehicleAssignmentServiceError(
      "This driver already has an active vehicle assignment.",
      409,
      "DRIVER_ALREADY_ASSIGNED",
    );
  }

  const assignment = await VehicleAssignment.create({
    organizationId: input.organizationId,
    vehicleId: input.vehicleId,
    driverId: input.driverId,
    assignedBy: input.assignedBy,
    expectedReturnDate: input.expectedReturnDate
      ? new Date(input.expectedReturnDate)
      : null,
    startingMileage: input.startingMileage,
    notes: input.notes,
    status: "active",
  });

  return assignment;
}

export async function getVehicleAssignmentsService(
  organizationId: string,
  options: {
    status?: AssignmentStatus;
    vehicleId?: string;
    driverId?: string;
    page: number;
    limit: number;
  },
) {
  const filter: Record<string, unknown> = {
    organizationId,
  };

  if (options.status) {
    filter.status = options.status;
  }

  if (options.vehicleId) {
    filter.vehicleId = options.vehicleId;
  }

  if (options.driverId) {
    filter.driverId = options.driverId;
  }

  const skip = (options.page - 1) * options.limit;

  const [assignments, total] = await Promise.all([
    VehicleAssignment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit)
      .lean(),

    VehicleAssignment.countDocuments(filter),
  ]);

  return {
    assignments,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function getVehicleAssignmentService(
  id: string,
  organizationId: string,
) {
  const assignment = await VehicleAssignment.findOne({
    _id: id,
    organizationId,
  }).lean();

  if (!assignment) {
    throw new VehicleAssignmentServiceError(
      "Vehicle assignment not found.",
      404,
      "ASSIGNMENT_NOT_FOUND",
    );
  }

  return assignment;
}

export async function completeVehicleAssignmentService(
  id: string,
  organizationId: string,
  endingMileage: number,
  notes?: string,
) {
  const assignment = await VehicleAssignment.findOne({
    _id: id,
    organizationId,
  });

  if (!assignment) {
    throw new VehicleAssignmentServiceError(
      "Vehicle assignment not found.",
      404,
      "ASSIGNMENT_NOT_FOUND",
    );
  }

  if (assignment.status !== "active") {
    throw new VehicleAssignmentServiceError(
      "Only active assignments can be completed.",
      400,
      "ASSIGNMENT_NOT_ACTIVE",
    );
  }

  if (endingMileage < assignment.startingMileage) {
    throw new VehicleAssignmentServiceError(
      "Ending mileage cannot be less than starting mileage.",
      400,
      "INVALID_ENDING_MILEAGE",
    );
  }

  assignment.status = "completed";
  assignment.endingMileage = endingMileage;
  assignment.returnedAt = new Date();

  if (notes) {
    assignment.notes = notes;
  }

  await assignment.save();

  return assignment;
}

export async function cancelVehicleAssignmentService(
  id: string,
  organizationId: string,
  notes?: string,
) {
  const assignment = await VehicleAssignment.findOne({
    _id: id,
    organizationId,
  });

  if (!assignment) {
    throw new VehicleAssignmentServiceError(
      "Vehicle assignment not found.",
      404,
      "ASSIGNMENT_NOT_FOUND",
    );
  }

  if (assignment.status !== "active") {
    throw new VehicleAssignmentServiceError(
      "Only active assignments can be cancelled.",
      400,
      "ASSIGNMENT_NOT_ACTIVE",
    );
  }

  assignment.status = "cancelled";
  assignment.returnedAt = new Date();

  if (notes) {
    assignment.notes = notes;
  }

  await assignment.save();

  return assignment;
}

export async function getVehicleAssignmentHistoryService(
  vehicleId: string,
  organizationId: string,
) {
  return VehicleAssignment.find({
    vehicleId,
    organizationId,
  })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getDriverAssignmentHistoryService(
  driverId: string,
  organizationId: string,
) {
  return VehicleAssignment.find({
    driverId,
    organizationId,
  })
    .sort({ createdAt: -1 })
    .lean();
}
