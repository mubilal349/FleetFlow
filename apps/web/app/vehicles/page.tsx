"use client";

import { useEffect, useState } from "react";

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
          {/* Header */}
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

          {/* Stats */}
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

          {/* Filters */}
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
              </select>

              <button
                onClick={handleSearch}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Search
              </button>

              <button
                onClick={clearFilters}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
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

                        <td className="px-6 py-5 text-right">
                          <button className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && vehicles.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {vehicles.length} of {total} vehicles
                </p>

                <div className="flex items-center gap-2">
                  <button
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

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchVehicles();
          }}
        />
      )}
    </div>
  );
}

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

function LoadingRows() {
  return (
    <>
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <tr key={index}>
          {Array.from({
            length: 7,
          }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-6 py-5">
              <div className="h-4 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

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

  const handleSubmit = async (event: React.FormEvent) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold">Add Vehicle</h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a new vehicle to your fleet.
            </p>
          </div>

          <button
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
    </div>
  );
}

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
