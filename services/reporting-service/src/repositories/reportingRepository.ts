import mongoose from "mongoose";

import type {
  AssignmentReport,
  InspectionReport,
  MaintenanceReport,
  VehicleOverview,
  VehicleStatusReport,
  VehicleTypeReport,
} from "../types/reportingTypes.js";

class ReportingRepository {
  private getCollection(name: string) {
    return mongoose.connection.collection(name);
  }

  async getVehicleOverview(organizationId: string): Promise<VehicleOverview> {
    const collection = this.getCollection("vehicles");

    const result = await collection
      .aggregate<VehicleOverview>([
        {
          $match: {
            organizationId,
          },
        },
        {
          $group: {
            _id: null,

            totalVehicles: {
              $sum: 1,
            },

            availableVehicles: {
              $sum: {
                $cond: [{ $eq: ["$status", "available"] }, 1, 0],
              },
            },

            assignedVehicles: {
              $sum: {
                $cond: [{ $eq: ["$status", "assigned"] }, 1, 0],
              },
            },

            inTripVehicles: {
              $sum: {
                $cond: [{ $eq: ["$status", "in_trip"] }, 1, 0],
              },
            },

            maintenanceVehicles: {
              $sum: {
                $cond: [{ $eq: ["$status", "maintenance"] }, 1, 0],
              },
            },

            inactiveVehicles: {
              $sum: {
                $cond: [{ $eq: ["$status", "inactive"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalVehicles: 1,
            availableVehicles: 1,
            assignedVehicles: 1,
            inTripVehicles: 1,
            maintenanceVehicles: 1,
            inactiveVehicles: 1,
          },
        },
      ])
      .toArray();

    return (
      result[0] || {
        totalVehicles: 0,
        availableVehicles: 0,
        assignedVehicles: 0,
        inTripVehicles: 0,
        maintenanceVehicles: 0,
        inactiveVehicles: 0,
      }
    );
  }

  async getVehicleStatusReport(
    organizationId: string,
  ): Promise<VehicleStatusReport[]> {
    const collection = this.getCollection("vehicles");

    return collection
      .aggregate<VehicleStatusReport>([
        {
          $match: {
            organizationId,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ])
      .toArray();
  }

  async getVehicleTypeReport(
    organizationId: string,
  ): Promise<VehicleTypeReport[]> {
    const collection = this.getCollection("vehicles");

    return collection
      .aggregate<VehicleTypeReport>([
        {
          $match: {
            organizationId,
          },
        },
        {
          $group: {
            _id: "$vehicleType",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0,
            vehicleType: "$_id",
            count: 1,
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ])
      .toArray();
  }

  async getMaintenanceReport(
    organizationId: string,
  ): Promise<MaintenanceReport> {
    const collection = this.getCollection("maintenances");

    const result = await collection
      .aggregate<MaintenanceReport>([
        {
          $match: {
            organizationId,
          },
        },
        {
          $group: {
            _id: null,

            totalMaintenance: {
              $sum: 1,
            },

            scheduled: {
              $sum: {
                $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0],
              },
            },

            inProgress: {
              $sum: {
                $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0],
              },
            },

            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
              },
            },

            overdue: {
              $sum: {
                $cond: [{ $eq: ["$status", "overdue"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalMaintenance: 1,
            scheduled: 1,
            inProgress: 1,
            completed: 1,
            overdue: 1,
          },
        },
      ])
      .toArray();

    return (
      result[0] || {
        totalMaintenance: 0,
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
      }
    );
  }

  async getInspectionReport(organizationId: string): Promise<InspectionReport> {
    const collection = this.getCollection("vehicleinspections");

    const [report] = await collection
      .aggregate<InspectionReport>([
        {
          $match: { organizationId },
        },
        {
          $group: {
            _id: null,
            totalInspections: { $sum: 1 },

            passed: {
              $sum: {
                $cond: [{ $eq: ["$overallResult", "passed"] }, 1, 0],
              },
            },

            failed: {
              $sum: {
                $cond: [{ $eq: ["$overallResult", "failed"] }, 1, 0],
              },
            },

            needsAttention: {
              $sum: {
                $cond: [{ $eq: ["$overallResult", "needs_attention"] }, 1, 0],
              },
            },

            draft: {
              $sum: {
                $cond: [{ $eq: ["$status", "draft"] }, 1, 0],
              },
            },

            cancelled: {
              $sum: {
                $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalInspections: 1,
            passed: 1,
            failed: 1,
            needsAttention: 1,
            draft: 1,
            cancelled: 1,
          },
        },
      ])
      .toArray();

    return (
      report ?? {
        totalInspections: 0,
        passed: 0,
        failed: 0,
        needsAttention: 0,
        draft: 0,
        cancelled: 0,
      }
    );
  }

  async getAssignmentReport(organizationId: string): Promise<AssignmentReport> {
    const collection = mongoose.connection.collection("vehicleassignments");

    const [report] = await collection
      .aggregate<AssignmentReport>([
        {
          $match: { organizationId },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            totalAssignments: { $sum: "$count" },
            active: {
              $sum: {
                $cond: [{ $eq: ["$_id", "active"] }, "$count", 0],
              },
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$_id", "completed"] }, "$count", 0],
              },
            },
            cancelled: {
              $sum: {
                $cond: [{ $eq: ["$_id", "cancelled"] }, "$count", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalAssignments: 1,
            active: 1,
            completed: 1,
            cancelled: 1,
          },
        },
      ])
      .toArray();

    return (
      report ?? {
        totalAssignments: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
      }
    );
  }
}

export const reportingRepository = new ReportingRepository();
