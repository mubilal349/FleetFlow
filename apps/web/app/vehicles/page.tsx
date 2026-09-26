"use client";
import Link from "next/link";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
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
    vehicles: Vehicle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type VehicleRequestForm = {
  purpose: string;
  pickupLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string;
};

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

export default function VehiclesPage() {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ============================================================
  // CUSTOMER VEHICLE REQUEST STATE
  // ============================================================

  const [showRequestModal, setShowRequestModal] = useState(false);

  const [requestVehicle, setRequestVehicle] = useState<Vehicle | null>(null);

  const [requestLoading, setRequestLoading] = useState(false);

  const [requestError, setRequestError] = useState("");

  const [requestSuccess, setRequestSuccess] = useState("");

  const [requestForm, setRequestForm] = useState<VehicleRequestForm>({
    purpose: "",
    pickupLocation: "",
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const canManageVehicles = user?.role === "admin" || user?.role === "manager";

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      if (vehicleType) {
        params.set("vehicleType", vehicleType);
      }

      params.set("page", String(page));
      params.set("limit", "10");

      const response = await api.get<VehicleResponse>(
        `/api/vehicles?${params.toString()}`,
      );

      setVehicles(response.data.data.vehicles);
      setTotal(response.data.data.total);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to fetch vehicles:", err);

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(err?.response?.data?.message || "Failed to load vehicles.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, status, vehicleType]);

  const handleSearch = () => {
    setPage(1);
    fetchVehicles();
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setVehicleType("");
    setPage(1);
  };

  // ============================================================
  // DEACTIVATE VEHICLE
  // ============================================================

  const handleDeactivate = async (vehicle: Vehicle) => {
    if (vehicle.status === "inactive") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`deactivate-${vehicle._id}`);
      setError("");

      await api.patch(`/api/vehicles/${vehicle._id}/status`, {
        status: "inactive",
      });

      await fetchVehicles();
    } catch (err: any) {
      console.error("Failed to deactivate vehicle:", err);

      setError(err?.response?.data?.message || "Failed to deactivate vehicle.");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // DELETE VEHICLE
  // ============================================================

  const handleDelete = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${vehicle._id}`);
      setError("");

      await api.delete(`/api/vehicles/${vehicle._id}`);

      if (selectedVehicle?._id === vehicle._id) {
        setSelectedVehicle(null);
      }

      if (editingVehicle?._id === vehicle._id) {
        setEditingVehicle(null);
      }

      await fetchVehicles();
    } catch (err: any) {
      console.error("Failed to delete vehicle:", err);

      setError(err?.response?.data?.message || "Failed to delete vehicle.");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // CUSTOMER VEHICLE REQUEST
  // ============================================================

  const handleOpenRequestModal = (vehicle: Vehicle) => {
    // Customer can only request an available vehicle.
    if (vehicle.status !== "available") {
      return;
    }

    setRequestVehicle(vehicle);

    setRequestForm({
      purpose: "",
      pickupLocation: "",
      destination: "",
      startDate: "",
      endDate: "",
      notes: "",
    });

    setRequestError("");
    setRequestSuccess("");
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    if (requestLoading) {
      return;
    }

    setShowRequestModal(false);
    setRequestVehicle(null);
    setRequestError("");
    setRequestSuccess("");
  };

  const handleRequestVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestVehicle) {
      return;
    }

    setRequestError("");
    setRequestSuccess("");

    if (!requestForm.purpose.trim()) {
      setRequestError("Please enter the purpose of the request.");
      return;
    }

    if (!requestForm.pickupLocation.trim()) {
      setRequestError("Please enter the pickup location.");
      return;
    }

    if (!requestForm.destination.trim()) {
      setRequestError("Please enter the destination.");
      return;
    }

    if (!requestForm.startDate) {
      setRequestError("Please select the start date and time.");
      return;
    }

    if (!requestForm.endDate) {
      setRequestError("Please select the end date and time.");
      return;
    }

    const startDate = new Date(requestForm.startDate);
    const endDate = new Date(requestForm.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setRequestError("Please provide valid dates.");
      return;
    }

    if (endDate <= startDate) {
      setRequestError("End date must be after start date.");
      return;
    }

    try {
      setRequestLoading(true);

      const response = await api.post("/api/vehicle-requests", {
        vehicleId: requestVehicle._id,
        purpose: requestForm.purpose.trim(),
        pickupLocation: requestForm.pickupLocation.trim(),
        destination: requestForm.destination.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: requestForm.notes.trim() || undefined,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to submit vehicle request.",
        );
      }

      setRequestSuccess(
        "Vehicle request submitted successfully. Your request is now pending.",
      );

      setTimeout(() => {
        setShowRequestModal(false);
        setRequestVehicle(null);
        setRequestSuccess("");
      }, 1800);
    } catch (err: any) {
      console.error("Failed to submit vehicle request:", err);

      setRequestError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit vehicle request.",
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const availableCount = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  ).length;

  const assignedCount = vehicles.filter(
    (vehicle) => vehicle.status === "assigned",
  ).length;

  const maintenanceCount = vehicles.filter(
    (vehicle) => vehicle.status === "maintenance",
  ).length;

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
              HEADER
          ============================================================ */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
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
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Vehicles
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage your fleet inventory and vehicle operations.
                  </p>
                </div>
              </div>
            </div>

            {canManageVehicles && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Add Vehicle
              </button>
            )}
          </div>

          {/* ============================================================
              STATS
          ============================================================ */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Vehicles" value={total} icon="fleet" />

            <StatCard
              label="Available"
              value={availableCount}
              icon="available"
            />

            <StatCard label="Assigned" value={assignedCount} icon="assigned" />

            <StatCard
              label="Maintenance"
              value={maintenanceCount}
              icon="maintenance"
            />
          </div>

          {/* ============================================================
              FILTERS
          ============================================================ */}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search registration, make or model..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">All Statuses</option>

                <option value="available">Available</option>

                <option value="assigned">Assigned</option>

                <option value="in_trip">In Trip</option>

                <option value="maintenance">Maintenance</option>

                <option value="inactive">Inactive</option>
              </select>

              <select
                value={vehicleType}
                onChange={(event) => {
                  setVehicleType(event.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">All Types</option>

                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="pickup">Pickup</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="trailer">Trailer</option>
                <option value="other">Other</option>
              </select>

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Search
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear
              </button>
            </div>
          </div>

          {/* ============================================================
              ERROR
          ============================================================ */}

          {error && (
            <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-950"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 6 12 12" />
                  <path d="m18 6-12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* ============================================================
              VEHICLE TABLE
          ============================================================ */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    <th className="px-6 py-4">Vehicle</th>

                    <th className="px-6 py-4">Type</th>

                    <th className="px-6 py-4">Year</th>

                    <th className="px-6 py-4">Fuel</th>

                    <th className="px-6 py-4">Mileage</th>

                    <th className="px-6 py-4">Status</th>

                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <LoadingRows />
                  ) : vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                          <svg
                            width="25"
                            height="25"
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

                        <p className="mt-4 font-semibold">No vehicles found</p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Add your first vehicle to start managing your fleet.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr
                        key={vehicle._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-semibold">
                              {vehicle.make} {vehicle.model}
                            </p>

                            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {vehicle.registrationNumber}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                          {vehicleTypeLabels[vehicle.vehicleType]}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                          {vehicle.year}
                        </td>

                        <td className="px-6 py-5 text-sm capitalize text-slate-600 dark:text-slate-300">
                          {vehicle.fuelType}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                          {vehicle.currentMileage.toLocaleString()} km
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[vehicle.status]}`}
                          >
                            {statusLabels[vehicle.status]}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1">
                            {/* ====================================================
                                CUSTOMER REQUEST BUTTON
                            ==================================================== */}

                            {user?.role === "customer" &&
                              vehicle.status === "available" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenRequestModal(vehicle)
                                  }
                                  title="Request vehicle"
                                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                                >
                                  <svg
                                    width="16"
                                    height="16"
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
                                  Request
                                </button>
                              )}

                            {/* View */}

                            <Link
                              href={`/vehicles/${vehicle._id}`}
                              title="View vehicle"
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                            >
                              View
                            </Link>

                            {/* Admin / Manager Actions */}

                            {canManageVehicles && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingVehicle(vehicle)}
                                  title="Edit vehicle"
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
                                </button>

                                {vehicle.status !== "inactive" && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeactivate(vehicle)}
                                    disabled={
                                      actionLoading ===
                                      `deactivate-${vehicle._id}`
                                    }
                                    title="Deactivate vehicle"
                                    className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                                  >
                                    {actionLoading ===
                                    `deactivate-${vehicle._id}` ? (
                                      <Spinner />
                                    ) : (
                                      <svg
                                        width="17"
                                        height="17"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                      >
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M8 12h8" />
                                      </svg>
                                    )}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDelete(vehicle)}
                                  disabled={
                                    actionLoading === `delete-${vehicle._id}`
                                  }
                                  title="Delete vehicle"
                                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                  {actionLoading === `delete-${vehicle._id}` ? (
                                    <Spinner />
                                  ) : (
                                    <svg
                                      width="17"
                                      height="17"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                    >
                                      <path d="M4 7h16" />
                                      <path d="M10 11v6" />
                                      <path d="M14 11v6" />
                                      <path d="M6 7l1 13h10l1-13" />
                                      <path d="M9 7V4h6v3" />
                                    </svg>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ============================================================
                PAGINATION
            ============================================================ */}

            {!loading && vehicles.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {vehicles.length} of {total} vehicles
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                  >
                    Previous
                  </button>

                  <span className="px-3 text-sm font-semibold">
                    {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ============================================================
          REQUEST VEHICLE MODAL
      ============================================================ */}

      {showRequestModal && requestVehicle && (
        <RequestVehicleModal
          vehicle={requestVehicle}
          form={requestForm}
          setForm={setRequestForm}
          loading={requestLoading}
          error={requestError}
          success={requestSuccess}
          onClose={handleCloseRequestModal}
          onSubmit={handleRequestVehicle}
        />
      )}

      {/* ============================================================
          ADD VEHICLE MODAL
      ============================================================ */}

      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchVehicles();
          }}
        />
      )}

      {/* ============================================================
          VIEW VEHICLE MODAL
      ============================================================ */}

      {selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* ============================================================
          EDIT VEHICLE MODAL
      ============================================================ */}

      {editingVehicle && (
        <EditVehicleModal
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onUpdated={() => {
            setEditingVehicle(null);
            fetchVehicles();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: "fleet" | "available" | "assigned" | "maintenance";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          {icon === "fleet" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h10" />
              <path d="M7 13h4" />
              <path d="M15 13h2" />
            </svg>
          )}

          {icon === "available" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          )}

          {icon === "assigned" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="8" r="3" />
              <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
            </svg>
          )}

          {icon === "maintenance" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M14 7a5 5 0 0 0-6 6l-5 5 3 3 5-5a5 5 0 0 0 6-6l-3 3-3-3 3-3Z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOADING ROWS
============================================================ */

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-6 py-5">
              <div className="h-4 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ============================================================
   SPINNER
============================================================ */

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" />

      <path d="M21 12a9 9 0 0 1-9 9" className="opacity-90" />
    </svg>
  );
}

/* ============================================================
   REQUEST VEHICLE MODAL
============================================================ */

function RequestVehicleModal({
  vehicle,
  form,
  setForm,
  loading,
  error,
  success,
  onClose,
  onSubmit,
}: {
  vehicle: Vehicle;
  form: VehicleRequestForm;
  setForm: React.Dispatch<React.SetStateAction<VehicleRequestForm>>;
  loading: boolean;
  error: string;
  success: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
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
              </div>

              <div>
                <h2 className="text-xl font-bold">Request Vehicle</h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {vehicle.make} {vehicle.model} · {vehicle.registrationNumber}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}

        <form onSubmit={onSubmit} className="p-6">
          {/* Vehicle Summary */}

          <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Vehicle Available
              </p>

              <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-300">
                {vehicle.make} {vehicle.model}
              </p>
            </div>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              Available
            </span>
          </div>

          {/* Error */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              {success}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Purpose */}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Purpose <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                required
                maxLength={500}
                value={form.purpose}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    purpose: event.target.value,
                  }))
                }
                placeholder="e.g. Business trip"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Pickup */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Pickup Location <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                required
                maxLength={500}
                value={form.pickupLocation}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    pickupLocation: event.target.value,
                  }))
                }
                placeholder="e.g. Hangu"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Destination */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Destination <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                required
                maxLength={500}
                value={form.destination}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
                placeholder="e.g. Peshawar"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Start */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Start Date & Time <span className="text-red-500">*</span>
              </label>

              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            {/* End */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                End Date & Time <span className="text-red-500">*</span>
              </label>

              <input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            {/* Notes */}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Notes{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>

              <textarea
                rows={4}
                maxLength={2000}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Add any additional information about your request..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Footer */}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || Boolean(success)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Spinner />}

              {loading
                ? "Submitting..."
                : success
                  ? "Request Submitted"
                  : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================
   VEHICLE DETAILS MODAL
============================================================ */

function VehicleDetailsModal({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle;
  onClose: () => void;
}) {
  const formatDate = (value?: string) => {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return date.toLocaleDateString();
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) {
      return "Not provided";
    }

    return value.toLocaleString();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
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
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {vehicle.make} {vehicle.model}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {vehicle.registrationNumber}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Status */}

          <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Current Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[vehicle.status]}`}
              >
                {statusLabels[vehicle.status]}
              </span>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vehicle ID
              </p>

              <p className="mt-1 max-w-[180px] truncate text-xs font-medium">
                {vehicle._id}
              </p>
            </div>
          </div>

          {/* Vehicle Information */}

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vehicle Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                label="Fuel Type"
                value={vehicle.fuelType.toUpperCase()}
              />

              <DetailItem
                label="Color"
                value={vehicle.color || "Not provided"}
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

              <DetailItem
                label="Driver"
                value={vehicle.driverId || "Not assigned"}
              />
            </div>
          </div>

          {/* Location */}

          <div className="mt-7">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Location
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm font-semibold">
                {vehicle.location?.address || "Location not provided"}
              </p>

              {(vehicle.location?.latitude !== undefined ||
                vehicle.location?.longitude !== undefined) && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Latitude: {vehicle.location?.latitude ?? "N/A"} · Longitude:{" "}
                  {vehicle.location?.longitude ?? "N/A"}
                </p>
              )}
            </div>
          </div>

          {/* Purchase */}

          <div className="mt-7">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Purchase Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          {/* Insurance */}

          <div className="mt-7">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Insurance
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
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
          </div>

          {/* Notes */}

          <div className="mt-7">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Notes
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
              {vehicle.notes || "No notes provided."}
            </div>
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================
   ADD VEHICLE MODAL
============================================================ */

function AddVehicleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    registrationNumber: "",
    make: "",
    model: "",
    year: "",
    vehicleType: "car",
    color: "",
    fuelType: "diesel",
    fuelCapacity: "",
    currentMileage: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/api/vehicles", {
        registrationNumber: form.registrationNumber,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        vehicleType: form.vehicleType,
        color: form.color || undefined,
        fuelType: form.fuelType,
        fuelCapacity: form.fuelCapacity ? Number(form.fuelCapacity) : undefined,
        currentMileage: form.currentMileage
          ? Number(form.currentMileage)
          : undefined,
        notes: form.notes || undefined,
      });

      onCreated();
    } catch (err: any) {
      console.error("Failed to create vehicle:", err);

      setError(err?.response?.data?.message || "Failed to create vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold">Add Vehicle</h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a new vehicle to your fleet.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Registration Number"
              required
              value={form.registrationNumber}
              onChange={(value) => updateField("registrationNumber", value)}
              placeholder="LEA-1234"
            />

            <Field
              label="Make"
              required
              value={form.make}
              onChange={(value) => updateField("make", value)}
              placeholder="Toyota"
            />

            <Field
              label="Model"
              required
              value={form.model}
              onChange={(value) => updateField("model", value)}
              placeholder="Hilux"
            />

            <Field
              label="Year"
              required
              type="number"
              value={form.year}
              onChange={(value) => updateField("year", value)}
              placeholder="2024"
            />

            <SelectField
              label="Vehicle Type"
              value={form.vehicleType}
              onChange={(value) => updateField("vehicleType", value)}
              options={[
                ["car", "Car"],
                ["van", "Van"],
                ["pickup", "Pickup"],
                ["truck", "Truck"],
                ["bus", "Bus"],
                ["motorcycle", "Motorcycle"],
                ["trailer", "Trailer"],
                ["other", "Other"],
              ]}
            />

            <SelectField
              label="Fuel Type"
              value={form.fuelType}
              onChange={(value) => updateField("fuelType", value)}
              options={[
                ["petrol", "Petrol"],
                ["diesel", "Diesel"],
                ["electric", "Electric"],
                ["hybrid", "Hybrid"],
                ["cng", "CNG"],
                ["lpg", "LPG"],
                ["other", "Other"],
              ]}
            />

            <Field
              label="Color"
              value={form.color}
              onChange={(value) => updateField("color", value)}
              placeholder="White"
            />

            <Field
              label="Fuel Capacity"
              type="number"
              value={form.fuelCapacity}
              onChange={(value) => updateField("fuelCapacity", value)}
              placeholder="80"
            />

            <Field
              label="Current Mileage"
              type="number"
              value={form.currentMileage}
              onChange={(value) => updateField("currentMileage", value)}
              placeholder="12500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">Notes</label>

            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={4}
              placeholder="Additional vehicle information..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================
   EDIT VEHICLE MODAL
============================================================ */

function EditVehicleModal({
  vehicle,
  onClose,
  onUpdated,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    registrationNumber: vehicle.registrationNumber,
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    vehicleType: vehicle.vehicleType,
    color: vehicle.color || "",
    fuelType: vehicle.fuelType,
    fuelCapacity:
      vehicle.fuelCapacity !== undefined ? String(vehicle.fuelCapacity) : "",
    currentMileage: String(vehicle.currentMileage),
    notes: vehicle.notes || "",
  });

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.patch(`/api/vehicles/${vehicle._id}`, {
        registrationNumber: form.registrationNumber,
        make: form.make,
        model: form.model,
        year: Number(form.year),
        vehicleType: form.vehicleType,
        color: form.color || undefined,
        fuelType: form.fuelType,
        fuelCapacity: form.fuelCapacity ? Number(form.fuelCapacity) : undefined,
        currentMileage: form.currentMileage ? Number(form.currentMileage) : 0,
        notes: form.notes || undefined,
      });

      onUpdated();
    } catch (err: any) {
      console.error("Failed to update vehicle:", err);

      setError(err?.response?.data?.message || "Failed to update vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold">Edit Vehicle</h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update vehicle information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
            Vehicle status is managed separately. Use the deactivate action from
            the vehicle list when you want to deactivate this vehicle.
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Registration Number"
              required
              value={form.registrationNumber}
              onChange={(value) => updateField("registrationNumber", value)}
              placeholder="LEA-1234"
            />

            <Field
              label="Make"
              required
              value={form.make}
              onChange={(value) => updateField("make", value)}
              placeholder="Toyota"
            />

            <Field
              label="Model"
              required
              value={form.model}
              onChange={(value) => updateField("model", value)}
              placeholder="Hilux"
            />

            <Field
              label="Year"
              required
              type="number"
              value={form.year}
              onChange={(value) => updateField("year", value)}
              placeholder="2024"
            />

            <SelectField
              label="Vehicle Type"
              value={form.vehicleType}
              onChange={(value) => updateField("vehicleType", value)}
              options={[
                ["car", "Car"],
                ["van", "Van"],
                ["pickup", "Pickup"],
                ["truck", "Truck"],
                ["bus", "Bus"],
                ["motorcycle", "Motorcycle"],
                ["trailer", "Trailer"],
                ["other", "Other"],
              ]}
            />

            <SelectField
              label="Fuel Type"
              value={form.fuelType}
              onChange={(value) => updateField("fuelType", value)}
              options={[
                ["petrol", "Petrol"],
                ["diesel", "Diesel"],
                ["electric", "Electric"],
                ["hybrid", "Hybrid"],
                ["cng", "CNG"],
                ["lpg", "LPG"],
                ["other", "Other"],
              ]}
            />

            <Field
              label="Color"
              value={form.color}
              onChange={(value) => updateField("color", value)}
              placeholder="White"
            />

            <Field
              label="Fuel Capacity"
              type="number"
              value={form.fuelCapacity}
              onChange={(value) => updateField("fuelCapacity", value)}
              placeholder="80"
            />

            <Field
              label="Current Mileage"
              type="number"
              value={form.currentMileage}
              onChange={(value) => updateField("currentMileage", value)}
              placeholder="12500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold">Notes</label>

            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={4}
              placeholder="Additional vehicle information..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Spinner />}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
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
   FIELD
============================================================ */

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
      />
    </div>
  );
}

/* ============================================================
   SELECT FIELD
============================================================ */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   MODAL BACKDROP
============================================================ */

function ModalBackdrop({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}
