import mongoose from "mongoose";

import {
  type IInspectionChecklist,
  type ChecklistStatus,
  type InspectionResult,
  type InspectionStatus,
  type InspectionType,
} from "../models/VehicleInspection.js";

import {
  createInspection,
  deleteInspection,
  findInspectionById,
  findInspections,
  findInspectionsByVehicle,
  updateInspection,
  type CreateInspectionData,
  type InspectionFilters,
} from "../repository/vehicleInspectionRepository.js";

import type {
  CreateVehicleInspectionInput,
  UpdateVehicleInspectionInput,
} from "../schemas/vehicleInspectionSchema.js";

interface ServiceContext {
  organizationId: string;
}

function validateObjectId(id: string, fieldName: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`${fieldName} is invalid.`);
  }
}

function calculateOverallResult(
  checklist: IInspectionChecklist,
): InspectionResult {
  const values: ChecklistStatus[] = [
    checklist.engine,
    checklist.brakes,
    checklist.tires,
    checklist.lights,
    checklist.battery,
    checklist.fluids,
    checklist.exterior,
    checklist.interior,
    checklist.safetyEquipment,
  ];

  if (values.includes("fail")) {
    return "failed";
  }

  if (values.includes("needs_attention")) {
    return "needs_attention";
  }

  if (values.every((value) => value === "pass")) {
    return "passed";
  }

  return "needs_attention";
}

function validateCompletedInspection(checklist: IInspectionChecklist): void {
  const checklistItems: Array<[keyof IInspectionChecklist, ChecklistStatus]> = [
    ["engine", checklist.engine],
    ["brakes", checklist.brakes],
    ["tires", checklist.tires],
    ["lights", checklist.lights],
    ["battery", checklist.battery],
    ["fluids", checklist.fluids],
    ["exterior", checklist.exterior],
    ["interior", checklist.interior],
    ["safetyEquipment", checklist.safetyEquipment],
  ];

  const uncheckedItems = checklistItems
    .filter(([, value]) => value === "not_checked")
    .map(([key]) => key);

  if (uncheckedItems.length > 0) {
    throw new Error(
      `All checklist items must be checked before completing the inspection. Unchecked items: ${uncheckedItems.join(", ")}.`,
    );
  }
}

function normalizeIssues(issues?: string[]): string[] {
  if (!issues) {
    return [];
  }

  return issues.map((issue) => issue.trim()).filter(Boolean);
}

export async function createVehicleInspection(
  input: CreateVehicleInspectionInput,
  context: ServiceContext,
) {
  validateObjectId(input.vehicleId, "Vehicle ID");
  validateObjectId(input.inspectorId, "Inspector ID");

  const checklist = input.checklist;

  const overallResult =
    input.overallResult ?? calculateOverallResult(checklist);

  const issues = normalizeIssues(input.issues);

  const inspectionData: CreateInspectionData = {
    organizationId: context.organizationId,
    vehicleId: input.vehicleId,
    inspectorId: input.inspectorId,
    inspectionType: input.inspectionType as InspectionType,
    inspectionDate: input.inspectionDate
      ? new Date(input.inspectionDate)
      : new Date(),
    mileage: input.mileage,
    checklist,
    overallResult,
    notes: input.notes,
    issues,
    status: "draft",
  };

  return createInspection(inspectionData);
}

export async function getVehicleInspections(
  filters: Omit<InspectionFilters, "organizationId">,
  context: ServiceContext,
) {
  return findInspections({
    ...filters,
    organizationId: context.organizationId,
  });
}

export async function getVehicleInspectionById(
  id: string,
  context: ServiceContext,
) {
  validateObjectId(id, "Inspection ID");

  const inspection = await findInspectionById(id, context.organizationId);

  if (!inspection) {
    throw new Error("Vehicle inspection not found.");
  }

  return inspection;
}

export async function getVehicleInspectionHistory(
  vehicleId: string,
  context: ServiceContext,
) {
  validateObjectId(vehicleId, "Vehicle ID");

  return findInspectionsByVehicle(vehicleId, context.organizationId);
}

export async function updateVehicleInspection(
  id: string,
  input: UpdateVehicleInspectionInput,
  context: ServiceContext,
) {
  validateObjectId(id, "Inspection ID");

  const existingInspection = await findInspectionById(
    id,
    context.organizationId,
  );

  if (!existingInspection) {
    throw new Error("Vehicle inspection not found.");
  }

  if (existingInspection.status === "completed") {
    throw new Error("Completed inspections cannot be edited.");
  }

  if (existingInspection.status === "cancelled") {
    throw new Error("Cancelled inspections cannot be edited.");
  }

  const updates: Partial<{
    inspectionType: InspectionType;
    inspectionDate: Date;
    mileage: number;
    checklist: typeof input.checklist;
    overallResult: InspectionResult;
    notes?: string;
    issues: string[];
    status: InspectionStatus;
  }> = {};

  if (input.inspectionType !== undefined) {
    updates.inspectionType = input.inspectionType;
  }

  if (input.inspectionDate !== undefined) {
    updates.inspectionDate = new Date(input.inspectionDate);
  }

  if (input.mileage !== undefined) {
    updates.mileage = input.mileage;
  }

  if (input.checklist !== undefined) {
    updates.checklist = input.checklist;
  }

  if (input.overallResult !== undefined) {
    updates.overallResult = input.overallResult;
  }

  if (input.notes !== undefined) {
    updates.notes = input.notes;
  }

  if (input.issues !== undefined) {
    updates.issues = normalizeIssues(input.issues);
  }

  if (input.status !== undefined) {
    if (input.status === "completed") {
      const checklist = input.checklist ?? existingInspection.checklist;

      validateCompletedInspection(checklist);

      updates.status = "completed";
      calculateOverallResult;
      updates.overallResult =
        input.overallResult ?? calculateOverallResult(checklist);
    } else {
      updates.status = input.status;
    }
  }

  if (input.checklist !== undefined && input.overallResult === undefined) {
    updates.overallResult = calculateOverallResult(input.checklist);
  }

  const updatedInspection = await updateInspection(
    id,
    context.organizationId,
    updates,
  );

  if (!updatedInspection) {
    throw new Error("Vehicle inspection could not be updated.");
  }

  return updatedInspection;
}

export async function completeVehicleInspection(
  id: string,
  context: ServiceContext,
) {
  validateObjectId(id, "Inspection ID");

  const existingInspection = await findInspectionById(
    id,
    context.organizationId,
  );

  if (!existingInspection) {
    throw new Error("Vehicle inspection not found.");
  }

  if (existingInspection.status === "completed") {
    throw new Error("Vehicle inspection is already completed.");
  }

  if (existingInspection.status === "cancelled") {
    throw new Error("Cancelled inspections cannot be completed.");
  }

  validateCompletedInspection(existingInspection.checklist);

  const overallResult = calculateOverallResult(existingInspection.checklist);

  const updatedInspection = await updateInspection(id, context.organizationId, {
    status: "completed",
    overallResult,
  });

  if (!updatedInspection) {
    throw new Error("Vehicle inspection could not be completed.");
  }

  return updatedInspection;
}

export async function cancelVehicleInspection(
  id: string,
  context: ServiceContext,
  notes?: string,
) {
  validateObjectId(id, "Inspection ID");

  const existingInspection = await findInspectionById(
    id,
    context.organizationId,
  );

  if (!existingInspection) {
    throw new Error("Vehicle inspection not found.");
  }

  if (existingInspection.status === "completed") {
    throw new Error("Completed inspections cannot be cancelled.");
  }

  if (existingInspection.status === "cancelled") {
    throw new Error("Vehicle inspection is already cancelled.");
  }

  const updatedNotes = notes?.trim() ? notes.trim() : existingInspection.notes;

  const updatedInspection = await updateInspection(id, context.organizationId, {
    status: "cancelled",
    ...(updatedNotes !== undefined ? { notes: updatedNotes } : {}),
  });

  if (!updatedInspection) {
    throw new Error("Vehicle inspection could not be cancelled.");
  }

  return updatedInspection;
}

export async function deleteVehicleInspection(
  id: string,
  context: ServiceContext,
) {
  validateObjectId(id, "Inspection ID");

  const existingInspection = await findInspectionById(
    id,
    context.organizationId,
  );

  if (!existingInspection) {
    throw new Error("Vehicle inspection not found.");
  }

  if (existingInspection.status === "completed") {
    throw new Error("Completed inspections cannot be deleted.");
  }

  const deletedInspection = await deleteInspection(id, context.organizationId);

  if (!deletedInspection) {
    throw new Error("Vehicle inspection could not be deleted.");
  }

  return deletedInspection;
}
