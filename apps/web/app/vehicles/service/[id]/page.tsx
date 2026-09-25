"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Gauge,
  Loader2,
  Pencil,
  Trash2,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";

import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceResponse {
  success: boolean;
  message: string;
  data: ServiceRecord;
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

function formatDate(date?: string) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date?: string) {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const styles: Record<ServiceStatus, string> = {
    scheduled:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    in_progress:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    cancelled: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const icons: Record<ServiceStatus, typeof Clock3> = {
    scheduled: Clock3,
    in_progress: Wrench,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {statusLabels[status]}
    </span>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof CarFront;
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-white/10 dark:bg-white/[0.025]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {label}
      </p>

      <p className="mt-1 break-words text-base font-semibold text-zinc-900 dark:text-white">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { collapsed } = useSidebar();

  const serviceId = typeof params.id === "string" ? params.id : "";

  const [service, setService] = useState<ServiceRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!serviceId) return;

    async function loadService() {
      try {
        setLoading(true);
        setError("");

        const response = await serviceApi.get<ServiceResponse>(
          `/services/${serviceId}`,
        );

        setService(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load service record.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [serviceId]);

  async function handleDelete() {
    if (!serviceId) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await serviceApi.delete(`/services/${serviceId}`);

      router.push("/dashboard/vehicles/service");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete service record.",
      );

      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050b18]">
      <DashboardSidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <DashboardHeader />

        <main className="px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Back */}
            <div className="mb-6">
              <Link
                href="/vehicles/service"
                className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                Back to Vehicle Service
              </Link>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm">Loading service record...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <XCircle className="h-7 w-7" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  Unable to load service record
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Service Details */}
            {!loading && !error && service && (
              <>
                {/* Header */}
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <Wrench className="h-6 w-6" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                        Service Details
                      </h1>

                      <StatusBadge status={service.status} />
                    </div>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {serviceTypeLabels[service.serviceType]}
                      {" · "}
                      Service ID: {service._id}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/vehicles/service/${service._id}/edit`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/5"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Service
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Overview */}
                <div className="mb-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="border-b border-zinc-200 p-5 dark:border-white/10 sm:p-7">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Service Overview
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Key information about this maintenance record.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
                    <DetailCard
                      icon={CarFront}
                      label="Vehicle"
                      value={service.vehicleId}
                    />

                    <DetailCard
                      icon={Wrench}
                      label="Service Type"
                      value={serviceTypeLabels[service.serviceType]}
                    />

                    <DetailCard
                      icon={CalendarClock}
                      label="Service Date"
                      value={formatDate(service.serviceDate)}
                    />

                    <DetailCard
                      icon={CircleDollarSign}
                      label="Total Cost"
                      value={formatCurrency(service.cost)}
                    />
                  </div>
                </div>

                {/* Service Information */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="border-b border-zinc-200 p-5 dark:border-white/10 sm:p-7">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Maintenance Information
                      </h2>
                    </div>

                    <div className="divide-y divide-zinc-200 dark:divide-white/10">
                      <div className="flex items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-3">
                          <Gauge className="h-5 w-5 text-zinc-400" />

                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              Mileage
                            </p>
                            <p className="text-xs text-zinc-500">
                              Vehicle mileage at service
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {service.mileage.toLocaleString()} km
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-3">
                          <CalendarClock className="h-5 w-5 text-zinc-400" />

                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              Next Service
                            </p>
                            <p className="text-xs text-zinc-500">
                              Recommended next maintenance
                            </p>
                          </div>
                        </div>

                        <p className="text-right text-sm font-semibold text-zinc-900 dark:text-white">
                          {formatDate(service.nextServiceDate)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-3">
                          <UserRound className="h-5 w-5 text-zinc-400" />

                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              Service Provider
                            </p>
                            <p className="text-xs text-zinc-500">
                              Workshop or provider
                            </p>
                          </div>
                        </div>

                        <p className="max-w-[50%] text-right text-sm font-semibold text-zinc-900 dark:text-white">
                          {service.serviceProvider || "Not specified"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-3">
                          <Clock3 className="h-5 w-5 text-zinc-400" />

                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              Status
                            </p>
                            <p className="text-xs text-zinc-500">
                              Current service status
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={service.status} />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="border-b border-zinc-200 p-5 dark:border-white/10 sm:p-7">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Service Notes
                      </h2>
                    </div>

                    <div className="p-5 sm:p-7">
                      {service.notes ? (
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
                          <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                            {service.notes}
                          </p>
                        </div>
                      ) : (
                        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-white/10">
                          <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            No service notes were added.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Record Metadata */}
                <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                    Record Information
                  </h2>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-zinc-500">Service ID</p>
                      <p className="mt-1 break-all text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {service._id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">Created By</p>
                      <p className="mt-1 break-all text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {service.createdBy}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">Created At</p>
                      <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {formatDateTime(service.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">Last Updated</p>
                      <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {formatDateTime(service.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && service && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1220] sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-zinc-900 dark:text-white">
              Delete service record?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              This action will permanently remove this service record. This
              cannot be undone.
            </p>

            {deleteError && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {deleteError}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
