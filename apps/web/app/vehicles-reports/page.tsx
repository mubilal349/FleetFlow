"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileCheck2,
  Gauge,
  RefreshCw,
  Truck,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";

import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { useSidebar } from "@/context/SidebarContext";

type VehicleOverview = {
  totalVehicles: number;
  availableVehicles: number;
  assignedVehicles: number;
  inTripVehicles: number;
  maintenanceVehicles: number;
  inactiveVehicles: number;
};

type VehicleStatusReport = {
  status: string;
  count: number;
};

type VehicleTypeReport = {
  vehicleType: string;
  count: number;
};

type UtilizationReport = {
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
};

type MaintenanceReport = {
  totalMaintenance: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

type InspectionReport = {
  totalInspections: number;
  passed: number;
  failed: number;
  needsAttention: number;
  draft: number;
  cancelled: number;
};

type AssignmentReport = {
  totalAssignments: number;
  active: number;
  completed: number;
  cancelled: number;
};

type VehicleDashboardReport = {
  overview: VehicleOverview;
  status: VehicleStatusReport[];
  types: VehicleTypeReport[];
  utilization: UtilizationReport;
  maintenance: MaintenanceReport;
  inspections: InspectionReport;
  assignments: AssignmentReport;
  generatedAt?: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

const REPORTS_API_URL = API_BASE_URL.endsWith("/api")
  ? `${API_BASE_URL}/reports/vehicles/dashboard`
  : `${API_BASE_URL}/api/reports/vehicles/dashboard`;

const numberFormat = new Intl.NumberFormat("en-US");

function formatNumber(value: number | undefined) {
  return numberFormat.format(value ?? 0);
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function percentage(value: number | undefined) {
  return `${Math.max(0, Math.min(100, value ?? 0))}%`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: typeof Truck;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-[#0b1220]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconColor}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Truck;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0b1220] sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function ProgressRow({
  label,
  count,
  total,
  color = "bg-blue-500",
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const width =
    total > 0 ? Math.min(100, Math.max(0, (count / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
          {formatNumber(count)}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700">
      <BarChart3 className="mx-auto mb-2 text-slate-400" size={25} />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export default function VehicleReportsPage() {
  const { collapsed } = useSidebar();

  const [report, setReport] = useState<VehicleDashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = localStorage.getItem("fleetflow_token");

      if (!token) {
        throw new Error(
          "Your login session was not found. Please log in to FleetFlow again.",
        );
      }

      const response = await fetch(REPORTS_API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const responseText = await response.text();
        let message = responseText;

        try {
          const parsed = JSON.parse(responseText);
          message =
            parsed.message || parsed.error || parsed.detail || responseText;
        } catch {
          // Keep the original response text when it isn't JSON.
        }

        if (response.status === 401) {
          throw new Error(
            "Your session has expired or your token is invalid. Please log in again.",
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to access vehicle reports.",
          );
        }

        if (response.status === 404) {
          throw new Error(
            "The reporting endpoint was not found. Check the API Gateway reporting route.",
          );
        }

        throw new Error(
          `Unable to load reports (HTTP ${response.status}). ${
            message || "Check the Reporting Service."
          }`,
        );
      }

      const result = await response.json();

      if (result.success === false) {
        throw new Error(
          result.message || "The reporting API returned an error.",
        );
      }

      const data = result.data ?? result;

      if (!data.overview || !data.utilization) {
        throw new Error(
          "The reporting API response is missing overview or utilization data.",
        );
      }

      setReport(data as VehicleDashboardReport);
    } catch (err) {
      console.error("Failed to retrieve vehicle reports:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to retrieve vehicle reports.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const overview = report?.overview;
  const maintenance = report?.maintenance;
  const inspections = report?.inspections;
  const assignments = report?.assignments;
  const utilization = report?.utilization;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      <DashboardSidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
        }`}
      >
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-600/20">
                  <BarChart3 size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Reporting &amp; Analytics
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                    Monitor fleet performance, utilization, maintenance, and
                    inspections.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void fetchReport(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh Reports"}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/20 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={21}
                    className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                  />
                  <div>
                    <h2 className="font-semibold text-red-800 dark:text-red-300">
                      Unable to load reports
                    </h2>
                    <p className="mt-1 break-words text-sm text-red-700 dark:text-red-300/90">
                      {error}
                    </p>
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      API endpoint: {REPORTS_API_URL}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void fetchReport(true)}
                  className="shrink-0 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1220]"
                  />
                ))}
              </div>
            )}

            {/* Dashboard content */}
            {!loading && report && (
              <>
                {/* Main statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Vehicles"
                    value={formatNumber(overview?.totalVehicles)}
                    subtitle="Vehicles registered in your fleet"
                    icon={Truck}
                    iconColor="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  />

                  <StatCard
                    title="Available Vehicles"
                    value={formatNumber(overview?.availableVehicles)}
                    subtitle="Ready for assignment"
                    icon={CheckCircle2}
                    iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  />

                  <StatCard
                    title="Assigned Vehicles"
                    value={formatNumber(overview?.assignedVehicles)}
                    subtitle="Currently assigned to drivers"
                    icon={Users}
                    iconColor="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                  />

                  <StatCard
                    title="In Trip"
                    value={formatNumber(overview?.inTripVehicles)}
                    subtitle="Vehicles currently on trips"
                    icon={Activity}
                    iconColor="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  />
                </div>

                {/* Utilization and status */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <SectionCard
                    title="Fleet Utilization"
                    subtitle="How much of your fleet is actively being used"
                    icon={Gauge}
                  >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                      <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center self-center rounded-full border-[10px] border-blue-100 dark:border-slate-800">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {percentage(utilization?.utilizationRate)}
                        </span>
                        <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Utilization
                        </span>
                      </div>

                      <div className="w-full space-y-4">
                        <ProgressRow
                          label="Active Vehicles"
                          count={utilization?.activeVehicles ?? 0}
                          total={utilization?.totalVehicles ?? 0}
                          color="bg-blue-500"
                        />
                        <ProgressRow
                          label="Available Vehicles"
                          count={overview?.availableVehicles ?? 0}
                          total={overview?.totalVehicles ?? 0}
                          color="bg-emerald-500"
                        />
                        <ProgressRow
                          label="In Maintenance"
                          count={overview?.maintenanceVehicles ?? 0}
                          total={overview?.totalVehicles ?? 0}
                          color="bg-amber-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Active
                        </p>
                        <p className="mt-1 text-xl font-bold">
                          {formatNumber(utilization?.activeVehicles)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Fleet Size
                        </p>
                        <p className="mt-1 text-xl font-bold">
                          {formatNumber(utilization?.totalVehicles)}
                        </p>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Vehicle Status"
                    subtitle="Distribution of vehicles by current status"
                    icon={Activity}
                  >
                    {report.status?.length ? (
                      <div className="space-y-5">
                        {[
                          "available",
                          "assigned",
                          "in_trip",
                          "maintenance",
                          "inactive",
                        ].map((status) => {
                          const count =
                            report.status.find((item) => item.status === status)
                              ?.count ?? 0;

                          const colors: Record<string, string> = {
                            available: "bg-emerald-500",
                            assigned: "bg-blue-500",
                            in_trip: "bg-violet-500",
                            maintenance: "bg-amber-500",
                            inactive: "bg-slate-400",
                          };

                          return (
                            <ProgressRow
                              key={status}
                              label={formatLabel(status)}
                              count={count}
                              total={overview?.totalVehicles ?? 0}
                              color={colors[status]}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState message="No vehicle status data available yet." />
                    )}
                  </SectionCard>
                </div>

                {/* Vehicle types and maintenance */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <SectionCard
                    title="Vehicles by Type"
                    subtitle="Breakdown of your fleet by vehicle category"
                    icon={Truck}
                  >
                    {report.types?.length ? (
                      <div className="space-y-5">
                        {report.types.map((item) => (
                          <ProgressRow
                            key={item.vehicleType}
                            label={formatLabel(item.vehicleType)}
                            count={item.count}
                            total={overview?.totalVehicles ?? 0}
                            color="bg-indigo-500"
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="No vehicle type data available yet." />
                    )}
                  </SectionCard>

                  <SectionCard
                    title="Maintenance Overview"
                    subtitle="Scheduled and completed maintenance activities"
                    icon={Wrench}
                  >
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
                        <CalendarClock
                          size={20}
                          className="text-blue-600 dark:text-blue-400"
                        />
                        <p className="mt-3 text-2xl font-bold">
                          {formatNumber(maintenance?.scheduled)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Scheduled
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                        <Clock
                          size={20}
                          className="text-amber-600 dark:text-amber-400"
                        />
                        <p className="mt-3 text-2xl font-bold">
                          {formatNumber(maintenance?.inProgress)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          In Progress
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                        <CheckCircle2
                          size={20}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                        <p className="mt-3 text-2xl font-bold">
                          {formatNumber(maintenance?.completed)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Completed
                        </p>
                      </div>

                      <div className="col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20 sm:col-span-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <AlertCircle
                              className="text-red-600 dark:text-red-400"
                              size={22}
                            />
                            <div>
                              <p className="font-semibold">
                                Overdue Maintenance
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Maintenance requiring attention
                              </p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatNumber(maintenance?.overdue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Total maintenance records
                      </span>
                      <span className="font-bold">
                        {formatNumber(maintenance?.totalMaintenance)}
                      </span>
                    </div>
                  </SectionCard>
                </div>

                {/* Inspections and assignments */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <SectionCard
                    title="Vehicle Inspections"
                    subtitle="Inspection results and outstanding checks"
                    icon={FileCheck2}
                  >
                    <div className="mb-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Total Inspections
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                          {formatNumber(inspections?.totalInspections)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Passed
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
                          <CheckCircle2
                            size={20}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          {formatNumber(inspections?.passed)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <ProgressRow
                        label="Failed"
                        count={inspections?.failed ?? 0}
                        total={inspections?.totalInspections ?? 0}
                        color="bg-red-500"
                      />
                      <ProgressRow
                        label="Needs Attention"
                        count={inspections?.needsAttention ?? 0}
                        total={inspections?.totalInspections ?? 0}
                        color="bg-amber-500"
                      />
                      <ProgressRow
                        label="Draft"
                        count={inspections?.draft ?? 0}
                        total={inspections?.totalInspections ?? 0}
                        color="bg-blue-500"
                      />
                      <ProgressRow
                        label="Cancelled"
                        count={inspections?.cancelled ?? 0}
                        total={inspections?.totalInspections ?? 0}
                        color="bg-slate-400"
                      />
                    </div>

                    {(inspections?.totalInspections ?? 0) === 0 && (
                      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                        No inspection records are currently reported. If
                        inspections already exist, verify the Reporting
                        Service&apos;s inspection collection and result field.
                      </p>
                    )}
                  </SectionCard>

                  <SectionCard
                    title="Vehicle Assignments"
                    subtitle="Overview of driver and vehicle assignments"
                    icon={Users}
                  >
                    <div className="mb-5 flex items-center justify-between rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Total Assignments
                        </p>
                        <p className="mt-2 text-3xl font-bold">
                          {formatNumber(assignments?.totalAssignments)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
                        <Users size={24} />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <ProgressRow
                        label="Active"
                        count={assignments?.active ?? 0}
                        total={assignments?.totalAssignments ?? 0}
                        color="bg-blue-500"
                      />
                      <ProgressRow
                        label="Completed"
                        count={assignments?.completed ?? 0}
                        total={assignments?.totalAssignments ?? 0}
                        color="bg-emerald-500"
                      />
                      <ProgressRow
                        label="Cancelled"
                        count={assignments?.cancelled ?? 0}
                        total={assignments?.totalAssignments ?? 0}
                        color="bg-slate-400"
                      />
                    </div>
                  </SectionCard>
                </div>

                {/* Fleet summary */}
                <SectionCard
                  title="Fleet Health Summary"
                  subtitle="A quick overview of vehicles requiring attention"
                  icon={Activity}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 size={21} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Available
                        </p>
                        <p className="text-xl font-bold">
                          {formatNumber(overview?.availableVehicles)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <ArrowUpRight size={21} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Assigned
                        </p>
                        <p className="text-xl font-bold">
                          {formatNumber(overview?.assignedVehicles)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Wrench size={21} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Maintenance
                        </p>
                        <p className="text-xl font-bold">
                          {formatNumber(overview?.maintenanceVehicles)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="rounded-xl bg-red-50 p-3 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        <XCircle size={21} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Inactive
                        </p>
                        <p className="text-xl font-bold">
                          {formatNumber(overview?.inactiveVehicles)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {report.generatedAt
                        ? `Last updated: ${new Date(
                            report.generatedAt,
                          ).toLocaleString()}`
                        : "Data provided by the FleetFlow Reporting Service"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Reporting connected
                    </span>
                  </div>
                </SectionCard>
              </>
            )}

            {!loading && !report && !error && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#0b1220]">
                <BarChart3 className="mx-auto mb-3 text-slate-400" size={36} />
                <h2 className="text-lg font-semibold">
                  No report data available
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Refresh the page or check the Reporting Service.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
