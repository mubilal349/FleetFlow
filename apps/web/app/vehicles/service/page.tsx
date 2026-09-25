"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";

import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { serviceApi } from "@/lib/serviceApi";

type ServiceType =
  | "routine_service"
  | "oil_change"
  | "tire_change"
  | "brake_service"
  | "engine_repair"
  | "inspection"
  | "other";

type ServiceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

interface VehicleService {
  _id: string;
  vehicleId: string;
  serviceType: ServiceType;
  serviceDate: string;
  nextServiceDate?: string;
  mileage: number;
  cost: number;
  serviceProvider?: string;
  notes?: string;
  status: ServiceStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ServicesData {
  services?: VehicleService[];
  pagination?: Pagination;
}

interface ServicesResponse {
  success?: boolean;
  message?: string;

  // API response:
  // {
  //   success: true,
  //   data: {
  //     services: [...]
  //   }
  // }
  data?: ServicesData | VehicleService[];

  // Also support these possible response formats.
  services?: VehicleService[];
  pagination?: Pagination;
}

const serviceTypeLabels: Record<ServiceType, string> = {
  routine_service: "Routine Service",
  oil_change: "Oil Change",
  tire_change: "Tire Change",
  brake_service: "Brake Service",
  engine_repair: "Engine Repair",
  inspection: "Inspection",
  other: "Other",
};

const serviceStatusLabels: Record<ServiceStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(date?: string) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") {
    return "PKR 0";
  }

  return `PKR ${value.toLocaleString("en-PK")}`;
}

function getStatusClasses(status: ServiceStatus) {
  switch (status) {
    case "scheduled":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";

    case "in_progress":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";

    case "completed":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case "cancelled":
      return "bg-red-500/10 text-red-600 dark:text-red-400";

    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400";
  }
}

function StatusIcon({ status }: { status: ServiceStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (status === "cancelled") {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  if (status === "in_progress") {
    return <Activity className="h-3.5 w-3.5" />;
  }

  return <Clock3 className="h-3.5 w-3.5" />;
}

/**
 * Normalize all supported service API response shapes.
 *
 * Supported:
 *
 * 1. [...]
 *
 * 2. {
 *      services: [...]
 *    }
 *
 * 3. {
 *      data: [...]
 *    }
 *
 * 4. {
 *      data: {
 *        services: [...]
 *      }
 *    }
 */
function normalizeServicesResponse(
  response: ServicesResponse | VehicleService[],
): VehicleService[] {
  // Direct array response
  if (Array.isArray(response)) {
    return response;
  }

  // Response:
  // {
  //   services: [...]
  // }
  if (Array.isArray(response.services)) {
    return response.services;
  }

  // Response:
  // {
  //   data: [...]
  // }
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Response:
  // {
  //   data: {
  //     services: [...]
  //   }
  // }
  if (
    response.data &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.services)
  ) {
    return response.data.services;
  }

  return [];
}

export default function VehicleServicePage() {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  const canScheduleService = user?.role === "admin" || user?.role === "manager";

  const [services, setServices] = useState<VehicleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | ServiceStatus>(
    "all",
  );

  const [typeFilter, setTypeFilter] = useState<"all" | ServiceType>("all");

  const [error, setError] = useState("");

  const fetchServices = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await serviceApi.get<
        ServicesResponse | VehicleService[]
      >("/services");

      console.log("VEHICLE SERVICES RESPONSE:", response);

      const normalizedServices = normalizeServicesResponse(response);

      console.log("NORMALIZED VEHICLE SERVICES:", normalizedServices);

      console.log("VEHICLE SERVICES COUNT:", normalizedServices.length);

      setServices(normalizedServices);
    } catch (err) {
      console.error("FAILED TO LOAD VEHICLE SERVICES:", err);

      setError(
        err instanceof Error ? err.message : "Failed to load vehicle services.",
      );

      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        service.vehicleId?.toLowerCase().includes(normalizedSearch) ||
        service.serviceProvider?.toLowerCase().includes(normalizedSearch) ||
        serviceTypeLabels[service.serviceType]
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || service.status === statusFilter;

      const matchesType =
        typeFilter === "all" || service.serviceType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [services, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = services.length;

    const scheduled = services.filter(
      (service) => service.status === "scheduled",
    ).length;

    const inProgress = services.filter(
      (service) => service.status === "in_progress",
    ).length;

    const completed = services.filter(
      (service) => service.status === "completed",
    ).length;

    const cancelled = services.filter(
      (service) => service.status === "cancelled",
    ).length;

    const totalCost = services.reduce(
      (sum, service) => sum + (service.cost || 0),
      0,
    );

    return {
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      totalCost,
    };
  }, [services]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-[#050b18] dark:text-white">
      <DashboardSidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <DashboardHeader />

        <main className="px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            {/* Breadcrumb */}
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Link
                href="/vehicles"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                Vehicles
              </Link>

              <span>/</span>

              <span className="text-zinc-900 dark:text-white">
                Vehicle Service
              </span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Wrench className="h-6 w-6" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Vehicle Service
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Manage vehicle maintenance, repairs and service history.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => fetchServices(true)}
                  disabled={refreshing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:text-blue-400"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </button>

                {canScheduleService && (
                  <Link
                    href="/vehicles/service/create"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Schedule Service
                  </Link>
                )}
              </div>
            </div>

            {/* Role notice */}
            {!canScheduleService && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div className="flex items-start gap-3">
                  <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      Service records are view-only for your role
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300/80">
                      You can view service history and details. Only
                      administrators and managers can schedule new vehicle
                      service records.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-500/20 dark:bg-red-500/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                      Unable to load vehicle services
                    </p>

                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchServices()}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {/* Total */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Wrench className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-medium text-zinc-400">
                    Total
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold">{stats.total}</p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Service records
                </p>
              </div>

              {/* Scheduled */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CalendarClock className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-medium text-zinc-400">
                    Upcoming
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold">{stats.scheduled}</p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Scheduled services
                </p>
              </div>

              {/* In Progress */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Activity className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-medium text-zinc-400">
                    Active
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold">{stats.inProgress}</p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  In progress
                </p>
              </div>

              {/* Completed */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-medium text-zinc-400">
                    Finished
                  </span>
                </div>

                <p className="mt-4 text-2xl font-bold">{stats.completed}</p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Completed services
                </p>
              </div>

              {/* Cost */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-medium text-zinc-400">
                    Cost
                  </span>
                </div>

                <p className="mt-4 truncate text-xl font-bold">
                  {formatCurrency(stats.totalCost)}
                </p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Total recorded cost
                </p>
              </div>
            </div>

            {/* Filters */}
            <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search vehicle, provider or service type..."
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "all" | ServiceStatus)
                  }
                  className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="all">All Statuses</option>

                  {Object.entries(serviceStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                {/* Type */}
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as "all" | ServiceType)
                  }
                  className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="all">All Service Types</option>

                  {Object.entries(serviceTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Showing{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {filteredServices.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {services.length}
                  </span>{" "}
                  services
                </p>

                {(search || statusFilter !== "all" || typeFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </section>

            {/* Loading */}
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />

                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Loading vehicle services...
                  </p>
                </div>
              </div>
            ) : filteredServices.length === 0 ? (
              /* Empty */
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Wrench className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-lg font-bold">
                  No service records found
                </h2>

                <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                  {search || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try changing your search or filters."
                    : "There are no vehicle service records available yet."}
                </p>

                {!search &&
                  statusFilter === "all" &&
                  typeFilter === "all" &&
                  canScheduleService && (
                    <Link
                      href="/vehicles/service/create"
                      className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Schedule First Service
                    </Link>
                  )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-white/10 dark:bg-white/[0.02]">
                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Vehicle
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Service
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Date
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Mileage
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Cost
                          </th>

                          <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Status
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {filteredServices.map((service) => (
                          <tr
                            key={service._id}
                            className="transition hover:bg-zinc-50/70 dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  <CarFront className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {service.vehicleId}
                                  </p>

                                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                    {service.serviceProvider || "No provider"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold">
                                {serviceTypeLabels[service.serviceType]}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-medium">
                                {formatDate(service.serviceDate)}
                              </p>

                              {service.nextServiceDate && (
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                  Next: {formatDate(service.nextServiceDate)}
                                </p>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-medium">
                                {service.mileage?.toLocaleString("en-PK")} km
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold">
                                {formatCurrency(service.cost)}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${getStatusClasses(
                                  service.status,
                                )}`}
                              >
                                <StatusIcon status={service.status} />

                                {serviceStatusLabels[service.status]}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-right">
                              <Link
                                href={`/vehicles/service/${service._id}`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:hover:text-blue-400"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile / tablet cards */}
                <div className="grid gap-4 lg:hidden">
                  {filteredServices.map((service) => (
                    <article
                      key={service._id}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <CarFront className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {service.vehicleId}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {service.serviceProvider || "No provider"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${getStatusClasses(
                            service.status,
                          )}`}
                        >
                          <StatusIcon status={service.status} />

                          {serviceStatusLabels[service.status]}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Service
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {serviceTypeLabels[service.serviceType]}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Service Date
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatDate(service.serviceDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Mileage
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {service.mileage?.toLocaleString("en-PK")} km
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Cost
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatCurrency(service.cost)}
                          </p>
                        </div>
                      </div>

                      {service.nextServiceDate && (
                        <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Next Service
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {formatDate(service.nextServiceDate)}
                          </p>
                        </div>
                      )}

                      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-white/5">
                        <Link
                          href={`/vehicles/service/${service._id}`}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-semibold transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:hover:text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                          View Service Details
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
