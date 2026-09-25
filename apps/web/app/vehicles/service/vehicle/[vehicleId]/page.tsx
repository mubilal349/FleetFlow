"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Gauge,
  Loader2,
  MapPin,
  Pencil,
  Wrench,
  XCircle,
} from "lucide-react";

import DashboardHeader from "../../../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { serviceApi } from "@/lib/serviceApi";

type ServiceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

type ServiceType =
  | "routine_service"
  | "oil_change"
  | "tire_change"
  | "brake_service"
  | "engine_repair"
  | "inspection"
  | "other";

interface ServiceRecord {
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

interface ServiceHistoryResponse {
  success: boolean;
  message: string;
  data: {
    services: ServiceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

const statusLabels: Record<ServiceStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMileage = (mileage: number) => {
  return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
};

const getStatusIcon = (status: ServiceStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4" />;

    case "in_progress":
      return <Clock3 className="h-4 w-4" />;

    case "cancelled":
      return <XCircle className="h-4 w-4" />;

    default:
      return <CalendarDays className="h-4 w-4" />;
  }
};

const getStatusClasses = (status: ServiceStatus) => {
  switch (status) {
    case "completed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

    case "in_progress":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400";

    case "cancelled":
      return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400";

    case "scheduled":
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
};

export default function VehicleServiceHistoryPage() {
  const { collapsed } = useSidebar();
  const { user, loading: authLoading } = useAuth();

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const id = parts[parts.length - 1];

    if (id) {
      setVehicleId(id);
    }
  }, []);

  useEffect(() => {
    if (!vehicleId || authLoading || !user) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await serviceApi.get<ServiceHistoryResponse>(
          `/services/vehicle/${vehicleId}`,
        );

        console.log("VEHICLE SERVICE HISTORY RESPONSE:", response);

        const history = response?.data?.services ?? [];

        console.log("NORMALIZED SERVICE HISTORY:", history);

        setServices(history);
      } catch (err) {
        console.error("FAILED TO FETCH SERVICE HISTORY:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load vehicle service history.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [vehicleId, authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#050b18] dark:text-white">
        <DashboardHeader />
        <DashboardSidebar />

        <main
          className={`min-h-screen pt-20 transition-all duration-300 ${
            collapsed ? "lg:pl-20" : "lg:pl-72"
          }`}
        >
          <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>

              <div>
                <p className="font-semibold">Loading service history</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Fetching maintenance records for this vehicle...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#050b18] dark:text-white">
        <DashboardHeader />
        <DashboardSidebar />

        <main
          className={`min-h-screen pt-20 transition-all duration-300 ${
            collapsed ? "lg:pl-20" : "lg:pl-72"
          }`}
        >
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/vehicles/service"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-blue-500 dark:text-zinc-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Vehicle Services
            </Link>

            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 dark:border-red-500/20 dark:bg-red-500/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Unable to load service history
              </h2>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#050b18] dark:text-white">
      <DashboardHeader />
      <DashboardSidebar />

      <main
        className={`min-h-screen pt-20 transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/vehicles/service"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-blue-500 dark:text-zinc-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Vehicle Services
            </Link>

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10">
                    <Car className="h-6 w-6 text-blue-500" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Vehicle Service History
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Maintenance Timeline
                    </h1>
                  </div>
                </div>

                <p className="max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                  Complete maintenance and service history for this vehicle.
                  Records are displayed from the most recent service to the
                  oldest.
                </p>
              </div>

              {(user?.role === "admin" || user?.role === "manager") && (
                <Link
                  href="/vehicles/service/create"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Wrench className="h-4 w-4" />
                  Add Service
                </Link>
              )}
            </div>
          </div>

          {/* Vehicle summary */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Car className="h-5 w-5 text-blue-500" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Vehicle ID
                  </p>

                  <p
                    className="mt-1 max-w-[220px] truncate text-sm font-semibold"
                    title={vehicleId ?? ""}
                  >
                    {vehicleId}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Wrench className="h-5 w-5 text-emerald-500" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Total Services
                  </p>

                  <p className="mt-1 text-xl font-bold">{services.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  <CircleDollarSign className="h-5 w-5 text-amber-500" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Total Cost
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {formatCurrency(
                      services.reduce((total, service) => {
                        return total + service.cost;
                      }, 0),
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Wrench className="h-7 w-7 text-blue-500" />
              </div>

              <h2 className="mt-5 text-xl font-bold">No service history yet</h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                There are no maintenance records associated with this vehicle.
                Once a service is created, it will appear here.
              </p>

              {(user?.role === "admin" || user?.role === "manager") && (
                <Link
                  href="/vehicles/service/create"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Wrench className="h-4 w-4" />
                  Create First Service
                </Link>
              )}
            </div>
          ) : (
            /* Timeline */
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Service Timeline</h2>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {services.length} maintenance{" "}
                    {services.length === 1 ? "record" : "records"}
                  </p>
                </div>

                <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex dark:text-zinc-400">
                  <CalendarDays className="h-4 w-4" />
                  Newest first
                </div>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute bottom-5 left-[19px] top-5 w-px bg-zinc-200 dark:bg-white/10 sm:left-[23px]" />

                <div className="space-y-8">
                  {services.map((service, index) => (
                    <div
                      key={service._id}
                      className="relative flex gap-4 sm:gap-6"
                    >
                      {/* Timeline marker */}
                      <div className="relative z-10 flex shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm dark:border-[#101827] sm:h-12 sm:w-12 ${
                            service.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : service.status === "cancelled"
                                ? "bg-red-500/15 text-red-500"
                                : service.status === "in_progress"
                                  ? "bg-blue-500/15 text-blue-500"
                                  : "bg-amber-500/15 text-amber-500"
                          }`}
                        >
                          {getStatusIcon(service.status)}
                        </div>
                      </div>

                      {/* Service card */}
                      <div className="min-w-0 flex-1">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-blue-500/30 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] sm:p-5">
                          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold sm:text-lg">
                                  {serviceTypeLabels[service.serviceType]}
                                </h3>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                    service.status,
                                  )}`}
                                >
                                  {getStatusIcon(service.status)}
                                  {statusLabels[service.status]}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                <CalendarDays className="h-4 w-4 shrink-0" />
                                {formatDate(service.serviceDate)}
                              </div>
                            </div>

                            <Link
                              href={`/vehicles/service/${service._id}`}
                              className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-blue-500/30 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:text-blue-400"
                            >
                              View Details
                              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                            </Link>
                          </div>

                          {/* Service information */}
                          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.02]">
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <Gauge className="h-3.5 w-3.5" />
                                Mileage
                              </div>

                              <p className="mt-1 text-sm font-semibold">
                                {formatMileage(service.mileage)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.02]">
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <CircleDollarSign className="h-3.5 w-3.5" />
                                Cost
                              </div>

                              <p className="mt-1 text-sm font-semibold">
                                {formatCurrency(service.cost)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.02]">
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <MapPin className="h-3.5 w-3.5" />
                                Provider
                              </div>

                              <p className="mt-1 truncate text-sm font-semibold">
                                {service.serviceProvider || "Not specified"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.02]">
                              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Next Service
                              </div>

                              <p className="mt-1 text-sm font-semibold">
                                {formatDate(service.nextServiceDate)}
                              </p>
                            </div>
                          </div>

                          {/* Notes */}
                          {service.notes && (
                            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                <FileText className="h-3.5 w-3.5" />
                                Service Notes
                              </div>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                                {service.notes}
                              </p>
                            </div>
                          )}

                          {/* Edit */}
                          {(user?.role === "admin" ||
                            user?.role === "manager") && (
                            <div className="mt-4 flex justify-end">
                              <Link
                                href={`/vehicles/service/${service._id}/edit`}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Service
                              </Link>
                            </div>
                          )}
                        </div>

                        {index === 0 && (
                          <div className="mt-2 ml-1 text-xs font-medium text-blue-500">
                            Latest service
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
