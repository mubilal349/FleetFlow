"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Loader2,
  Save,
  Wrench,
} from "lucide-react";

import DashboardHeader from "../../../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../../../components/dashboard/DashboardSidebar";
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
}

interface ServiceResponse {
  success?: boolean;
  message?: string;
  data?: VehicleService;
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

function formatDateForInput(date?: string) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function EditVehicleServicePage() {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  const canEditService = user?.role === "admin" || user?.role === "manager";

  /*
   * The dynamic route gives us the service ID.
   *
   * Example:
   * /vehicles/service/68d123abc/edit
   *
   * params.id = "68d123abc"
   */
  const [serviceId, setServiceId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] =
    useState<ServiceType>("routine_service");

  const [serviceDate, setServiceDate] = useState("");
  const [nextServiceDate, setNextServiceDate] = useState("");

  const [mileage, setMileage] = useState("");
  const [cost, setCost] = useState("");

  const [serviceProvider, setServiceProvider] = useState("");
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<ServiceStatus>("scheduled");

  /*
   * Get dynamic route ID on the client.
   *
   * We intentionally use window.location.pathname here so this
   * page remains compatible with the current Next.js setup.
   */
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);

    const editIndex = parts.indexOf("edit");

    if (editIndex > 0) {
      const id = parts[editIndex - 1];

      if (id) {
        setServiceId(id);
      }
    }
  }, []);

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await serviceApi.get<ServiceResponse | VehicleService>(
        `/services/${serviceId}`,
      );

      console.log("VEHICLE SERVICE DETAILS RESPONSE:", response);

      /*
       * Support both:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * and:
       *
       * {
       *   _id: "...",
       *   ...
       * }
       */
      const service =
        "data" in response && response.data ? response.data : response;

      if (!service || !("_id" in service)) {
        throw new Error("Vehicle service record was not found.");
      }

      setVehicleId(service.vehicleId || "");

      setServiceType(service.serviceType || "routine_service");

      setServiceDate(formatDateForInput(service.serviceDate));

      setNextServiceDate(formatDateForInput(service.nextServiceDate));

      setMileage(
        typeof service.mileage === "number" ? String(service.mileage) : "",
      );

      setCost(typeof service.cost === "number" ? String(service.cost) : "");

      setServiceProvider(service.serviceProvider || "");

      setNotes(service.notes || "");

      setStatus(service.status || "scheduled");
    } catch (err) {
      console.error("FAILED TO LOAD VEHICLE SERVICE:", err);

      setError(
        err instanceof Error ? err.message : "Failed to load vehicle service.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEditService) {
      setError("You do not have permission to edit vehicle service records.");
      return;
    }

    setError("");
    setSuccess("");

    const mileageNumber = Number(mileage);
    const costNumber = Number(cost);

    if (!vehicleId.trim()) {
      setError("Vehicle ID is required.");
      return;
    }

    if (!serviceDate) {
      setError("Service date is required.");
      return;
    }

    if (!Number.isFinite(mileageNumber) || mileageNumber < 0) {
      setError("Please enter a valid mileage.");
      return;
    }

    if (!Number.isFinite(costNumber) || costNumber < 0) {
      setError("Please enter a valid service cost.");
      return;
    }

    if (nextServiceDate && new Date(nextServiceDate) < new Date(serviceDate)) {
      setError("Next service date cannot be earlier than the service date.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        vehicleId: vehicleId.trim(),
        serviceType,
        serviceDate,
        ...(nextServiceDate ? { nextServiceDate } : {}),
        mileage: mileageNumber,
        cost: costNumber,
        ...(serviceProvider.trim()
          ? {
              serviceProvider: serviceProvider.trim(),
            }
          : {}),
        ...(notes.trim()
          ? {
              notes: notes.trim(),
            }
          : {}),
        status,
      };

      console.log("UPDATE VEHICLE SERVICE PAYLOAD:", payload);

      const response = await serviceApi.patch<ServiceResponse>(
        `/services/${serviceId}`,
        payload,
      );

      console.log("UPDATE VEHICLE SERVICE RESPONSE:", response);

      setSuccess(
        response.message || "Vehicle service record updated successfully.",
      );

      /*
       * Return to details page after successful update.
       */
      setTimeout(() => {
        window.location.href = `/vehicles/service/${serviceId}`;
      }, 700);
    } catch (err) {
      console.error("FAILED TO UPDATE VEHICLE SERVICE:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update vehicle service.",
      );
    } finally {
      setSaving(false);
    }
  };

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
          <div className="mx-auto max-w-5xl">
            {/* Breadcrumb */}
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Link
                href="/vehicles"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                Vehicles
              </Link>

              <span>/</span>

              <Link
                href="/vehicles/service"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                Vehicle Service
              </Link>

              <span>/</span>

              <span className="text-zinc-900 dark:text-white">Edit</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  <Wrench className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Edit Vehicle Service
                  </h1>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Update maintenance and service record details.
                  </p>
                </div>
              </div>

              <Link
                href={`/vehicles/service/${serviceId}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Details
              </Link>
            </div>

            {/* Permission */}
            {!canEditService && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                  You do not have permission to edit service records.
                </p>

                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Only administrators and managers can update vehicle service
                  records.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />

                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Loading service record...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Error */}
                {error && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-500/20 dark:bg-red-500/10">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      {success}
                    </p>
                  </div>
                )}

                {/* Form */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                  {/* Basic information */}
                  <div className="border-b border-zinc-200 p-5 dark:border-white/10 sm:p-7">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold">Service Information</h2>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Update the vehicle and service information.
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Vehicle ID */}
                      <div>
                        <label
                          htmlFor="vehicleId"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Vehicle ID
                        </label>

                        <div className="relative">
                          <CarFront className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="vehicleId"
                            type="text"
                            value={vehicleId}
                            onChange={(e) => setVehicleId(e.target.value)}
                            disabled={!canEditService || saving}
                            placeholder="Enter vehicle ID"
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                          />
                        </div>
                      </div>

                      {/* Service Type */}
                      <div>
                        <label
                          htmlFor="serviceType"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Type
                        </label>

                        <select
                          id="serviceType"
                          value={serviceType}
                          onChange={(e) =>
                            setServiceType(e.target.value as ServiceType)
                          }
                          disabled={!canEditService || saving}
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                        >
                          {Object.entries(serviceTypeLabels).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label
                          htmlFor="status"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Status
                        </label>

                        <select
                          id="status"
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as ServiceStatus)
                          }
                          disabled={!canEditService || saving}
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                        >
                          {Object.entries(serviceStatusLabels).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      {/* Provider */}
                      <div>
                        <label
                          htmlFor="serviceProvider"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Provider
                        </label>

                        <div className="relative">
                          <Wrench className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="serviceProvider"
                            type="text"
                            value={serviceProvider}
                            onChange={(e) => setServiceProvider(e.target.value)}
                            disabled={!canEditService || saving}
                            maxLength={200}
                            placeholder="e.g. Toyota Service Center"
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates & financial */}
                  <div className="border-b border-zinc-200 p-5 dark:border-white/10 sm:p-7">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold">
                        Dates & Service Cost
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Update service scheduling and cost information.
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Service Date */}
                      <div>
                        <label
                          htmlFor="serviceDate"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Date
                        </label>

                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="serviceDate"
                            type="date"
                            value={serviceDate}
                            onChange={(e) => setServiceDate(e.target.value)}
                            disabled={!canEditService || saving}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Next Service Date */}
                      <div>
                        <label
                          htmlFor="nextServiceDate"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Next Service Date
                          <span className="ml-1 text-xs font-normal text-zinc-400">
                            Optional
                          </span>
                        </label>

                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="nextServiceDate"
                            type="date"
                            value={nextServiceDate}
                            onChange={(e) => setNextServiceDate(e.target.value)}
                            disabled={!canEditService || saving}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Mileage */}
                      <div>
                        <label
                          htmlFor="mileage"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Mileage
                        </label>

                        <div className="relative">
                          <input
                            id="mileage"
                            type="number"
                            min="0"
                            step="1"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            disabled={!canEditService || saving}
                            placeholder="e.g. 30000"
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                          />

                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                            km
                          </span>
                        </div>
                      </div>

                      {/* Cost */}
                      <div>
                        <label
                          htmlFor="cost"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Cost
                        </label>

                        <div className="relative">
                          <CircleDollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            disabled={!canEditService || saving}
                            placeholder="e.g. 170000"
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-16 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                          />

                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                            PKR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="p-5 sm:p-7">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold">Service Notes</h2>

                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Add observations, repair details or other useful
                        information.
                      </p>
                    </div>

                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={!canEditService || saving}
                      maxLength={5000}
                      rows={6}
                      placeholder="Enter service observations..."
                      className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                    />

                    <div className="mt-2 flex justify-end">
                      <span className="text-xs text-zinc-400">
                        {notes.length}/5000
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 bg-zinc-50/70 p-5 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row sm:justify-end sm:p-6">
                    <Link
                      href={`/vehicles/service/${serviceId}`}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
                    >
                      Cancel
                    </Link>

                    {canEditService && (
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
