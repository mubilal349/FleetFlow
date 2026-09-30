import {
  VehicleInspection,
  type IVehicleInspection,
  type InspectionResult,
  type InspectionStatus,
  type InspectionType,
} from "../models/VehicleInspection.js";

export interface InspectionFilters {
  organizationId: string;
  vehicleId?: string;
  inspectorId?: string;
  status?: InspectionStatus;
  overallResult?: InspectionResult;
  inspectionType?: InspectionType;
  page?: number;
  limit?: number;
}

export interface CreateInspectionData {
  organizationId: string;
  vehicleId: string;
  inspectorId: string;
  inspectionType: InspectionType;
  inspectionDate: Date;
  mileage: number;
  checklist: IVehicleInspection["checklist"];
  overallResult: InspectionResult;
  notes?: string;
  issues: string[];
  status: InspectionStatus;
}

export async function createInspection(
  data: CreateInspectionData,
): Promise<IVehicleInspection> {
  const inspection = await VehicleInspection.create(data);

  return inspection;
}

export async function findInspections(filters: InspectionFilters): Promise<{
  inspections: IVehicleInspection[];
  total: number;
}> {
  const {
    organizationId,
    vehicleId,
    inspectorId,
    status,
    overallResult,
    inspectionType,
    page = 1,
    limit = 10,
  } = filters;

  const query: Record<string, unknown> = {
    organizationId,
  };

  if (vehicleId) {
    query.vehicleId = vehicleId;
  }

  if (inspectorId) {
    query.inspectorId = inspectorId;
  }

  if (status) {
    query.status = status;
  }

  if (overallResult) {
    query.overallResult = overallResult;
  }

  if (inspectionType) {
    query.inspectionType = inspectionType;
  }

  const skip = (page - 1) * limit;

  const [inspections, total] = await Promise.all([
    VehicleInspection.find(query)
      .sort({
        inspectionDate: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .exec(),

    VehicleInspection.countDocuments(query),
  ]);

  return {
    inspections,
    total,
  };
}

export async function findInspectionById(
  id: string,
  organizationId: string,
): Promise<IVehicleInspection | null> {
  return VehicleInspection.findOne({
    _id: id,
    organizationId,
  }).exec();
}

export async function findInspectionsByVehicle(
  vehicleId: string,
  organizationId: string,
): Promise<IVehicleInspection[]> {
  return VehicleInspection.find({
    vehicleId,
    organizationId,
  })
    .sort({
      inspectionDate: -1,
      createdAt: -1,
    })
    .exec();
}

export async function updateInspection(
  id: string,
  organizationId: string,
  updates: Partial<
    Pick<
      IVehicleInspection,
      | "inspectionType"
      | "inspectionDate"
      | "mileage"
      | "checklist"
      | "overallResult"
      | "notes"
      | "issues"
      | "status"
    >
  >,
): Promise<IVehicleInspection | null> {
  return VehicleInspection.findOneAndUpdate(
    {
      _id: id,
      organizationId,
    },
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    },
  ).exec();
}

export async function deleteInspection(
  id: string,
  organizationId: string,
): Promise<IVehicleInspection | null> {
  return VehicleInspection.findOneAndDelete({
    _id: id,
    organizationId,
  }).exec();
}
