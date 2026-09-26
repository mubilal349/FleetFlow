"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../components/dashboard/DashboardSidebar";

import { useSidebar } from "@/context/SidebarContext";
import { api } from "@/lib/api";

type VehicleStatus =
  | "available"
  | "assigned"
  | "in_trip"
  | "maintenance"
  | "inactive";

type VehicleType =
  | "car"
  | "van"
  | "pickup"
  | "truck"
  | "bus"
  | "motorcycle"
  | "trailer"
  | "other";

type FuelType =
  | "petrol"
  | "diesel"
  | "electric"
  | "hybrid"
  | "cng"
  | "lpg"
  | "other";

interface Vehicle {
  _id: string;
  organizationId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  color?: string;
  status: VehicleStatus;
  fuelType: FuelType;
  fuelCapacity?: number;
  currentMileage: number;
  driverId?: string | null;

  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null;

  purchaseDate?: string;
  purchasePrice?: number;

  insurance?: {
    provider?: string;
    policyNumber?: string;
    expiryDate?: string;
  } | null;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface VehicleResponse {
  success: boolean;
  message: string;
  data: {
    vehicle: Vehicle;
  };
}

const statusStyles: Record<VehicleStatus, string> = {
  available:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",

  assigned: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",

  in_trip:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",

  maintenance:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",

  inactive: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const statusLabels: Record<VehicleStatus, string> = {
  available: "Available",
  assigned: "Assigned",
  in_trip: "In Trip",
  maintenance: "Maintenance",
  inactive: "Inactive",
};

const vehicleTypeLabels: Record<VehicleType, string> = {
  car: "Car",
  van: "Van",
  pickup: "Pickup",
  truck: "Truck",
  bus: "Bus",
  motorcycle: "Motorcycle",
  trailer: "Trailer",
  other: "Other",
};

export default function VehicleDetailsPage() {
  const { collapsed } = useSidebar();
  const params = useParams();

  const vehicleId = params?.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vehicleId) {
      return;
    }

    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<VehicleResponse>(
        `/api/vehicles/${vehicleId}`,
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load vehicle.");
      }

      setVehicle(response.data.data.vehicle);
    } catch (err: any) {
      console.error("Failed to fetch vehicle:", err);

      if (err?.response?.status === 404) {
        setError("Vehicle not found.");
      } else if (err?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(
          err?.response?.data?.message || "Failed to load vehicle details.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value?: string) => {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) {
      return "Not provided";
    }

    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      <DashboardSidebar />

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
        }`}
      >
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* ============================================================
              TOP NAVIGATION
          ============================================================ */}

          <div className="mb-6">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Back to Vehicles
            </Link>
          </div>

          {/* ============================================================
              LOADING
          ============================================================ */}

          {loading && <VehicleDetailsSkeleton />}

          {/* ============================================================
              ERROR
          ============================================================ */}

          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-bold">Unable to Load Vehicle</h2>

              <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchVehicle}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ============================================================
              VEHICLE DETAILS
          ============================================================ */}

          {!loading && !error && vehicle && (
            <>
              {/* HEADER */}

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M5 17h14" />
                        <path d="M6 17l1-6h10l1 6" />
                        <path d="M8 11l1.5-4h5L16 11" />
                        <circle cx="8" cy="18" r="1.5" />
                        <circle cx="16" cy="18" r="1.5" />
                      </svg>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                          {vehicle.make} {vehicle.model}
                        </h1>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[vehicle.status]}`}
                        >
                          {statusLabels[vehicle.status]}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {vehicle.registrationNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/vehicles/service?vehicleId=${vehicle._id}`;
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M14 7a5 5 0 0 0-6 6l-5 5 3 3 5-5a5 5 0 0 0 6-6l-3 3-3-3 3-3Z" />
                    </svg>
                    Service
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/vehicles`;
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                    Manage Vehicle
                  </button>
                </div>
              </div>

              {/* QUICK STATS */}

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <QuickStat
                  label="Current Mileage"
                  value={`${formatNumber(vehicle.currentMileage)} km`}
                  icon="mileage"
                />

                <QuickStat
                  label="Vehicle Type"
                  value={vehicleTypeLabels[vehicle.vehicleType]}
                  icon="vehicle"
                />

                <QuickStat
                  label="Fuel Type"
                  value={vehicle.fuelType?.toUpperCase() || "N/A"}
                  icon="fuel"
                />

                <QuickStat
                  label="Year"
                  value={String(vehicle.year)}
                  icon="calendar"
                />
              </div>

              {/* MAIN GRID */}

              <div className="mt-8 grid gap-6 xl:grid-cols-3">
                {/* VEHICLE INFORMATION */}

                <section className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <SectionHeader
                    title="Vehicle Information"
                    description="Core information about this vehicle."
                    icon="vehicle"
                  />

                  <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="Registration Number"
                      value={vehicle.registrationNumber}
                    />

                    <DetailItem label="Make" value={vehicle.make} />

                    <DetailItem label="Model" value={vehicle.model} />

                    <DetailItem label="Year" value={String(vehicle.year)} />

                    <DetailItem
                      label="Vehicle Type"
                      value={vehicleTypeLabels[vehicle.vehicleType]}
                    />

                    <DetailItem
                      label="Color"
                      value={vehicle.color || "Not provided"}
                    />

                    <DetailItem
                      label="Fuel Type"
                      value={vehicle.fuelType?.toUpperCase() || "N/A"}
                    />

                    <DetailItem
                      label="Fuel Capacity"
                      value={
                        vehicle.fuelCapacity !== undefined
                          ? `${formatNumber(vehicle.fuelCapacity)} L`
                          : "Not provided"
                      }
                    />

                    <DetailItem
                      label="Current Mileage"
                      value={`${formatNumber(vehicle.currentMileage)} km`}
                    />
                  </div>
                </section>

                {/* STATUS */}

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <SectionHeader
                    title="Current Status"
                    description="Current operational state."
                    icon="status"
                  />

                  <div className="p-6">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Status
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${statusStyles[vehicle.status]}`}
                      >
                        {statusLabels[vehicle.status]}
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Assigned Driver
                      </p>

                      <p className="mt-2 break-all text-sm font-semibold">
                        {vehicle.driverId || "No driver assigned"}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* LOCATION + PURCHASE */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* LOCATION */}

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <SectionHeader
                    title="Location"
                    description="Latest recorded vehicle location."
                    icon="location"
                  />

                  <div className="p-6">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                      <p className="text-sm font-semibold">
                        {vehicle.location?.address || "Location not provided"}
                      </p>

                      {(vehicle.location?.latitude !== undefined ||
                        vehicle.location?.longitude !== undefined) && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <DetailItem
                            label="Latitude"
                            value={
                              vehicle.location?.latitude !== undefined
                                ? String(vehicle.location.latitude)
                                : "N/A"
                            }
                          />

                          <DetailItem
                            label="Longitude"
                            value={
                              vehicle.location?.longitude !== undefined
                                ? String(vehicle.location.longitude)
                                : "N/A"
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* PURCHASE */}

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <SectionHeader
                    title="Purchase Information"
                    description="Vehicle acquisition information."
                    icon="purchase"
                  />

                  <div className="grid gap-4 p-6 sm:grid-cols-2">
                    <DetailItem
                      label="Purchase Date"
                      value={formatDate(vehicle.purchaseDate)}
                    />

                    <DetailItem
                      label="Purchase Price"
                      value={
                        vehicle.purchasePrice !== undefined
                          ? formatNumber(vehicle.purchasePrice)
                          : "Not provided"
                      }
                    />
                  </div>
                </section>
              </div>

              {/* INSURANCE */}

              <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <SectionHeader
                  title="Insurance"
                  description="Insurance and policy information."
                  icon="insurance"
                />

                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem
                    label="Provider"
                    value={vehicle.insurance?.provider || "Not provided"}
                  />

                  <DetailItem
                    label="Policy Number"
                    value={vehicle.insurance?.policyNumber || "Not provided"}
                  />

                  <DetailItem
                    label="Expiry Date"
                    value={formatDate(vehicle.insurance?.expiryDate)}
                  />
                </div>
              </section>

              {/* NOTES */}

              <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <SectionHeader
                  title="Notes"
                  description="Additional information about this vehicle."
                  icon="notes"
                />

                <div className="p-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                    {vehicle.notes || "No notes provided."}
                  </div>
                </div>
              </section>

              {/* RECORD INFORMATION */}

              <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <SectionHeader
                  title="Record Information"
                  description="System timestamps for this vehicle."
                  icon="record"
                />

                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailItem label="Vehicle ID" value={vehicle._id} />

                  <DetailItem
                    label="Created"
                    value={formatDateTime(vehicle.createdAt)}
                  />

                  <DetailItem
                    label="Last Updated"
                    value={formatDateTime(vehicle.updatedAt)}
                  />
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   QUICK STAT
============================================================ */

function QuickStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: "mileage" | "vehicle" | "fuel" | "calendar";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          {icon === "mileage" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 19h16" />
              <path d="M6 16l3-4 3 2 5-7" />
              <path d="M17 7h2v2" />
            </svg>
          )}

          {icon === "vehicle" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M5 17h14" />
              <path d="M6 17l1-6h10l1 6" />
              <path d="M8 11l1.5-4h5L16 11" />
              <circle cx="8" cy="18" r="1.5" />
              <circle cx="16" cy="18" r="1.5" />
            </svg>
          )}

          {icon === "fuel" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15" />
              <path d="M6 20h10" />
              <path d="M9 7h4" />
              <path d="M16 8h2l2 2v7a2 2 0 0 1-4 0v-4" />
            </svg>
          )}

          {icon === "calendar" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon:
    | "vehicle"
    | "status"
    | "location"
    | "purchase"
    | "insurance"
    | "notes"
    | "record";
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
        {icon === "vehicle" && (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M5 17h14" />
            <path d="M6 17l1-6h10l1 6" />
            <path d="M8 11l1.5-4h5L16 11" />
            <circle cx="8" cy="18" r="1.5" />
            <circle cx="16" cy="18" r="1.5" />
          </svg>
        )}

        {icon === "status" && (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 2.5 2.5L16 9" />
          </svg>
        )}

        {icon === "location" && (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        )}

        {icon === "purchase" && (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 7h16v13H4z" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M8 12h8" />
          </svg>
        )}

        {icon === "insurance" && (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
            <path d="m8.5 12 2.2 2.2 4.8-5" />
          </svg>
        )}

        {icon === "notes" && (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 5h16v14H4z" />
            <path d="M8 9h8" />
            <path d="M8 13h6" />
          </svg>
        )}

        {icon === "record" && (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
          </svg>
        )}
      </div>

      <div>
        <h2 className="text-base font-bold">{title}</h2>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}

/* ============================================================
   SKELETON
============================================================ */

function VehicleDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />

        <div>
          <div className="h-7 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />

          <div className="mt-2 h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 xl:col-span-2" />

        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />

        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
