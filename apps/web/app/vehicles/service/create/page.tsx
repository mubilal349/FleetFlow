"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  Loader2,
  Save,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../../components/dashboard/DashboardSidebar";
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

const serviceTypes: {
  value: ServiceType;
  label: string;
}[] = [
  {
    value: "routine_service",
    label: "Routine Service",
  },
  {
    value: "oil_change",
    label: "Oil Change",
  },
  {
    value: "tire_change",
    label: "Tire Change",
  },
  {
    value: "brake_service",
    label: "Brake Service",
  },
  {
    value: "engine_repair",
    label: "Engine Repair",
  },
  {
    value: "inspection",
    label: "Inspection",
  },
  {
    value: "other",
    label: "Other",
  },
];

const serviceStatuses: {
  value: ServiceStatus;
  label: string;
}[] = [
  {
    value: "scheduled",
    label: "Scheduled",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CreateVehicleServicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { collapsed } = useSidebar();

  const canScheduleService = user?.role === "admin" || user?.role === "manager";

  const [vehicleId, setVehicleId] = useState("");

  const [serviceType, setServiceType] =
    useState<ServiceType>("routine_service");

  const [serviceDate, setServiceDate] = useState(getToday());
  const [nextServiceDate, setNextServiceDate] = useState("");

  const [mileage, setMileage] = useState("");
  const [cost, setCost] = useState("");

  const [serviceProvider, setServiceProvider] = useState("");

  const [status, setStatus] = useState<ServiceStatus>("scheduled");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!canScheduleService) {
      setError(
        "Only administrators and managers can schedule vehicle service.",
      );
      return;
    }

    if (!user?.id) {
      setError("Your session could not be verified. Please log in again.");
      return;
    }

    // -----------------------------
    // Frontend validation
    // -----------------------------

    if (!vehicleId.trim()) {
      setError("Vehicle ID is required.");
      return;
    }

    if (!serviceDate) {
      setError("Service date is required.");
      return;
    }

    if (mileage === "") {
      setError("Mileage is required.");
      return;
    }

    if (cost === "") {
      setError("Service cost is required.");
      return;
    }

    const mileageNumber = Number(mileage);
    const costNumber = Number(cost);

    if (!Number.isFinite(mileageNumber) || mileageNumber < 0) {
      setError("Mileage must be a valid number greater than or equal to 0.");
      return;
    }

    if (!Number.isFinite(costNumber) || costNumber < 0) {
      setError("Cost must be a valid number greater than or equal to 0.");
      return;
    }

    if (nextServiceDate && nextServiceDate < serviceDate) {
      setError("Next service date cannot be earlier than the service date.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        vehicleId: vehicleId.trim(),
        serviceType,
        serviceDate,
        ...(nextServiceDate
          ? {
              nextServiceDate,
            }
          : {}),
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

      console.log("CURRENT USER:", user);

      console.log("CURRENT USER ID:", user.id);

      console.log("CREATE SERVICE PAYLOAD:", payload);

      const response = await serviceApi.post("/services", payload);

      console.log("CREATE SERVICE RESPONSE:", response);

      setSuccess("Vehicle service scheduled successfully.");

      setTimeout(() => {
        router.push("/vehicles/service");
      }, 700);
    } catch (err) {
      console.error("CREATE SERVICE ERROR:", err);

      let message = "Failed to create vehicle service.";

      if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
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
          <div className="mx-auto max-w-[1400px]">
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

              <span className="text-zinc-900 dark:text-white">
                Schedule Service
              </span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/vehicles/service"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:text-blue-400"
                  aria-label="Back to vehicle service"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>

                <div>
                  <div className="flex items-center gap-3">
                    <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:flex dark:text-blue-400">
                      <Wrench className="h-5 w-5" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Schedule Vehicle Service
                    </h1>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Create a maintenance or repair service record for a vehicle.
                  </p>
                </div>
              </div>
            </div>

            {/* Permission notice */}
            {!canScheduleService && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      Service scheduling is restricted
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300/80">
                      You can view this service form, but only administrators
                      and managers can schedule vehicle service records.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <p className="font-semibold">Unable to schedule service</p>

                <p className="mt-1">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 shrink-0" />

                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* Main form */}
                <div className="space-y-6">
                  {/* Service Details */}
                  <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="border-b border-zinc-200 px-5 py-5 dark:border-white/10 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Wrench className="h-5 w-5" />
                        </div>

                        <div>
                          <h2 className="font-semibold">Service Details</h2>

                          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            Enter the basic service information.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                      {/* Vehicle ID */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="vehicleId"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Vehicle ID
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <CarFront className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="vehicleId"
                            type="text"
                            value={vehicleId}
                            onChange={(e) => setVehicleId(e.target.value)}
                            placeholder="Enter vehicle ID"
                            disabled={!canScheduleService}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                            required
                          />
                        </div>

                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          Enter the vehicle identifier already registered in
                          FleetFlow.
                        </p>
                      </div>

                      {/* Service Type */}
                      <div>
                        <label
                          htmlFor="serviceType"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Type
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <select
                          id="serviceType"
                          value={serviceType}
                          onChange={(e) =>
                            setServiceType(e.target.value as ServiceType)
                          }
                          disabled={!canScheduleService}
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                        >
                          {serviceTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
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
                          disabled={!canScheduleService}
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                        >
                          {serviceStatuses.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Service date */}
                      <div>
                        <label
                          htmlFor="serviceDate"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Date
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="serviceDate"
                            type="date"
                            value={serviceDate}
                            onChange={(e) => setServiceDate(e.target.value)}
                            disabled={!canScheduleService}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Next service date */}
                      <div>
                        <label
                          htmlFor="nextServiceDate"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Next Service Date
                        </label>

                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="nextServiceDate"
                            type="date"
                            value={nextServiceDate}
                            min={serviceDate}
                            onChange={(e) => setNextServiceDate(e.target.value)}
                            disabled={!canScheduleService}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Maintenance Information */}
                  <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="border-b border-zinc-200 px-5 py-5 dark:border-white/10 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          <Gauge className="h-5 w-5" />
                        </div>

                        <div>
                          <h2 className="font-semibold">
                            Maintenance Information
                          </h2>

                          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            Record mileage, cost and service provider.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                      {/* Mileage */}
                      <div>
                        <label
                          htmlFor="mileage"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Mileage
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Gauge className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                          <input
                            id="mileage"
                            type="number"
                            min="0"
                            step="1"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            placeholder="e.g. 45000"
                            disabled={!canScheduleService}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                            required
                          />
                        </div>

                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          Current vehicle mileage in kilometers.
                        </p>
                      </div>

                      {/* Cost */}
                      <div>
                        <label
                          htmlFor="cost"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Cost
                          <span className="ml-1 text-red-500">*</span>
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
                            placeholder="e.g. 15000"
                            disabled={!canScheduleService}
                            className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                            required
                          />
                        </div>

                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          Enter the service cost in PKR.
                        </p>
                      </div>

                      {/* Provider */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="serviceProvider"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Service Provider
                        </label>

                        <input
                          id="serviceProvider"
                          type="text"
                          value={serviceProvider}
                          onChange={(e) => setServiceProvider(e.target.value)}
                          maxLength={200}
                          placeholder="e.g. Toyota Service Center"
                          disabled={!canScheduleService}
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Notes */}
                  <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="border-b border-zinc-200 px-5 py-5 dark:border-white/10 sm:px-6">
                      <h2 className="font-semibold">Service Notes</h2>

                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Add additional information about the service.
                      </p>
                    </div>

                    <div className="p-5 sm:p-6">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={5000}
                        rows={6}
                        disabled={!canScheduleService}
                        placeholder="Describe the work required, parts replaced, technician notes, or any other useful information..."
                        className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                      />

                      <div className="mt-2 flex justify-end text-xs text-zinc-400">
                        {notes.length}/5000
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                  {/* Summary */}
                  <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] lg:sticky lg:top-24">
                    <div className="border-b border-zinc-200 px-5 py-5 dark:border-white/10">
                      <h2 className="font-semibold">Service Summary</h2>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Review the information before submitting.
                      </p>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Vehicle
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold">
                          {vehicleId || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Service Type
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            serviceTypes.find(
                              (item) => item.value === serviceType,
                            )?.label
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Service Date
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {serviceDate || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Status
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {
                            serviceStatuses.find(
                              (item) => item.value === status,
                            )?.label
                          }
                        </span>
                      </div>

                      <div className="border-t border-zinc-100 pt-4 dark:border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            Estimated Cost
                          </span>

                          <span className="font-bold">
                            {cost
                              ? `PKR ${Number(cost).toLocaleString()}`
                              : "PKR 0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-200 p-5 dark:border-white/10">
                      {canScheduleService ? (
                        <>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Scheduling...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Schedule Service
                              </>
                            )}
                          </button>

                          <Link
                            href="/vehicles/service"
                            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
                          >
                            Cancel
                          </Link>
                        </>
                      ) : (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                          <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

                            <div>
                              <p className="text-sm font-semibold">View Only</p>

                              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                Only admin and manager users can schedule
                                vehicle service.
                              </p>
                            </div>
                          </div>

                          <Link
                            href="/vehicles/service"
                            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
                          >
                            Back to Service
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                        <Wrench className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                          Maintenance Tip
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300/80">
                          Keep the mileage and next service date updated to
                          maintain an accurate vehicle maintenance history.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
