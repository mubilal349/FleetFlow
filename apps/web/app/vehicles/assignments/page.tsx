"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../components/dashboard/DashboardSidebar";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type AssignmentStatus = "active" | "completed" | "cancelled";

type VehicleStatus =
  | "available"
  | "assigned"
  | "in_trip"
  | "maintenance"
  | "inactive";

interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  status: VehicleStatus;
  currentMileage?: number;
  driverId?: string | null;
}

interface Driver {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface Assignment {
  _id: string;
  organizationId: string;
  vehicleId: string;
  driverId: string;
  assignedBy: string;
  assignedAt: string;
  expectedReturnDate?: string | null;
  returnedAt?: string | null;
  status: AssignmentStatus;
  startingMileage: number;
  endingMileage?: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentDetailResponse extends Assignment {
  vehicle?: Vehicle;
  driver?: Driver;
  assignedByUser?: Driver;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type ModalType = "assign" | "view" | "complete" | "cancel" | null;

const PAGE_SIZE = 10;

const statusStyles: Record<AssignmentStatus, string> = {
  active:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20",

  completed:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",

  cancelled:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20",
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMileage(mileage?: number | null) {
  if (mileage === undefined || mileage === null) {
    return "—";
  }

  return `${mileage.toLocaleString()} km`;
}

function getStatusLabel(status: AssignmentStatus) {
  switch (status) {
    case "active":
      return "Active";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function getVehicleName(vehicle?: Vehicle) {
  if (!vehicle) {
    return "Unknown vehicle";
  }

  return `${vehicle.make} ${vehicle.model}`;
}

function getDriverName(driver?: Driver) {
  if (!driver) {
    return "Unknown driver";
  }

  return driver.name || driver.email || "Unknown driver";
}

export default function VehicleAssignmentsPage() {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingOptions, setLoadingOptions] = useState(true);

  const [viewLoading, setViewLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | AssignmentStatus>(
    "all",
  );

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalAssignments, setTotalAssignments] = useState(0);

  const [modal, setModal] = useState<ModalType>(null);

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [viewAssignment, setViewAssignment] =
    useState<AssignmentDetailResponse | null>(null);

  const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null);

  const [viewDriver, setViewDriver] = useState<Driver | null>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [selectedDriverId, setSelectedDriverId] = useState("");

  const [startingMileage, setStartingMileage] = useState("");

  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  const [notes, setNotes] = useState("");

  const [endingMileage, setEndingMileage] = useState("");

  const [actionNotes, setActionNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const canManageAssignments =
    user?.role === "admin" || user?.role === "manager";

  /**
   * Load assignment records.
   */
  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await api.get(`/api/assignments?${params.toString()}`);

      const result = response.data as ApiResponse<Assignment[]>;

      if (!result.success) {
        throw new Error(result.message || "Failed to load assignments.");
      }

      setAssignments(result.data || []);

      setTotalAssignments(result.pagination?.total || 0);

      setTotalPages(Math.max(1, result.pagination?.totalPages || 1));
    } catch (err) {
      console.error("Failed to load assignments:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load vehicle assignments.",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load available vehicles and drivers independently.
   */
  async function loadOptions() {
    setLoadingOptions(true);

    let vehiclesLoaded = false;
    let driversLoaded = false;

    try {
      setError("");

      /**
       * LOAD VEHICLES
       */
      try {
        console.log("🔵 Loading available vehicles...");

        const vehiclesResponse = await api.get(
          "/api/vehicles?status=available&limit=100",
        );

        console.log("🟢 FULL VEHICLE RESPONSE:", vehiclesResponse.data);

        const result = vehiclesResponse.data;

        let vehicleList: Vehicle[] = [];

        if (Array.isArray(result?.data)) {
          vehicleList = result.data;
        } else if (Array.isArray(result?.data?.vehicles)) {
          vehicleList = result.data.vehicles;
        } else if (Array.isArray(result?.data?.data)) {
          vehicleList = result.data.data;
        } else if (Array.isArray(result)) {
          vehicleList = result;
        }

        console.log("🟢 EXTRACTED VEHICLES:", vehicleList);

        const availableVehicleList = vehicleList.filter(
          (vehicle) =>
            String(vehicle.status).trim().toLowerCase() === "available",
        );

        console.log("🟢 AVAILABLE VEHICLES:", availableVehicleList);

        setVehicles(availableVehicleList);

        vehiclesLoaded = true;
      } catch (err: any) {
        console.error(
          "🔴 Failed to load available vehicles:",
          err?.response?.data || err,
        );

        setVehicles([]);
      }

      /**
       * LOAD DRIVERS
       */
      try {
        console.log("🔵 Loading drivers...");

        const driversResponse = await api.get(
          "/api/users?role=driver&limit=100",
        );

        console.log("🟢 FULL DRIVERS RESPONSE:", driversResponse.data);

        const result = driversResponse.data;

        let driverList: Driver[] = [];

        if (Array.isArray(result?.data)) {
          driverList = result.data;
        } else if (Array.isArray(result?.data?.users)) {
          driverList = result.data.users;
        } else if (Array.isArray(result?.data?.data)) {
          driverList = result.data.data;
        } else if (Array.isArray(result)) {
          driverList = result;
        }

        const normalizedDrivers: Driver[] = driverList
          .map((driver: any) => ({
            _id: driver._id || driver.id,
            name: driver.name,
            email: driver.email,
            role: driver.role,
          }))
          .filter((driver) => driver._id);

        console.log("🟢 EXTRACTED DRIVERS:", normalizedDrivers);

        setDrivers(normalizedDrivers);

        driversLoaded = true;
      } catch (err: any) {
        console.error("🔴 Failed to load drivers:", err?.response?.data || err);

        setDrivers([]);
      }

      if (!vehiclesLoaded && !driversLoaded) {
        setError(
          "Unable to load assignment options. Please check the API Gateway and service connections.",
        );
      } else if (!vehiclesLoaded) {
        setError(
          "Available vehicles could not be loaded. Please check the Vehicle Service.",
        );
      } else if (!driversLoaded) {
        console.warn(
          "⚠️ Vehicles loaded successfully, but drivers could not be loaded.",
        );
      }
    } finally {
      setLoadingOptions(false);
    }
  }

  useEffect(() => {
    void loadAssignments();
  }, [page, statusFilter]);

  useEffect(() => {
    void loadOptions();
  }, []);

  const filteredAssignments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return assignments;
    }

    return assignments.filter((assignment) => {
      const vehicle = vehicles.find(
        (item) => item._id === assignment.vehicleId,
      );

      const driver = drivers.find((item) => item._id === assignment.driverId);

      const searchable = [
        assignment.vehicleId,
        assignment.driverId,
        assignment.status,
        vehicle?.registrationNumber,
        vehicle?.make,
        vehicle?.model,
        driver?.name,
        driver?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(value);
    });
  }, [assignments, vehicles, drivers, search]);

  const activeAssignments = assignments.filter(
    (item) => item.status === "active",
  ).length;

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "available",
  ).length;

  function resetAssignForm() {
    setSelectedVehicleId("");
    setSelectedDriverId("");
    setStartingMileage("");
    setExpectedReturnDate("");
    setNotes("");
  }

  function openAssignModal() {
    resetAssignForm();

    setError("");
    setSuccess("");

    void loadOptions();

    setModal("assign");
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setModal(null);
    setSelectedAssignment(null);
    setViewAssignment(null);
    setViewVehicle(null);
    setViewDriver(null);
    setEndingMileage("");
    setActionNotes("");
    setError("");
    setViewLoading(false);
  }

  /**
   * Open assignment details.
   *
   * Uses:
   * GET /api/assignments/:id
   *
   * If the backend only returns IDs, the current
   * vehicle/driver lists are used as fallback.
   */
  async function openViewModal(assignment: Assignment) {
    setModal("view");
    setViewLoading(true);
    setError("");

    setSelectedAssignment(assignment);

    setViewAssignment(assignment);
    setViewVehicle(getVehicle(assignment.vehicleId) || null);
    setViewDriver(getDriver(assignment.driverId) || null);

    try {
      const response = await api.get(`/api/assignments/${assignment._id}`);

      const result = response.data as ApiResponse<AssignmentDetailResponse>;

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to load assignment details.");
      }

      const detail = result.data;

      setViewAssignment(detail);

      setViewVehicle(detail.vehicle || getVehicle(detail.vehicleId) || null);

      setViewDriver(detail.driver || getDriver(detail.driverId) || null);
    } catch (err) {
      console.error("Failed to load assignment details:", err);

      /*
       * We keep the assignment already available in the table
       * so the modal can still display useful information.
       */
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load assignment details.",
      );
    } finally {
      setViewLoading(false);
    }
  }

  function openCompleteModal(assignment: Assignment) {
    setSelectedAssignment(assignment);

    setEndingMileage(String(assignment.startingMileage));

    setActionNotes("");

    setError("");
    setSuccess("");

    setModal("complete");
  }

  function openCancelModal(assignment: Assignment) {
    setSelectedAssignment(assignment);

    setActionNotes("");

    setError("");
    setSuccess("");

    setModal("cancel");
  }

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVehicleId) {
      setError("Please select a vehicle.");
      return;
    }

    if (!selectedDriverId) {
      setError("Please select a driver.");
      return;
    }

    if (startingMileage === "" || Number(startingMileage) < 0) {
      setError("Please enter a valid starting mileage.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/api/assignments", {
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
        startingMileage: Number(startingMileage),
        expectedReturnDate: expectedReturnDate
          ? new Date(expectedReturnDate).toISOString()
          : null,
        ...(notes.trim()
          ? {
              notes: notes.trim(),
            }
          : {}),
      });

      const result = response.data as ApiResponse<Assignment>;

      if (!result.success) {
        throw new Error(result.message || "Failed to assign vehicle.");
      }

      setModal(null);

      resetAssignForm();

      setSuccess("Vehicle assigned successfully.");

      await Promise.all([loadAssignments(), loadOptions()]);
    } catch (err) {
      console.error("Failed to assign vehicle:", err);

      setError(
        err instanceof Error ? err.message : "Failed to assign vehicle.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAssignment) {
      return;
    }

    const ending = Number(endingMileage);

    if (
      endingMileage === "" ||
      Number.isNaN(ending) ||
      ending < selectedAssignment.startingMileage
    ) {
      setError(
        `Ending mileage must be at least ${selectedAssignment.startingMileage.toLocaleString()} km.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.patch(
        `/api/assignments/${selectedAssignment._id}/complete`,
        {
          endingMileage: ending,

          ...(actionNotes.trim()
            ? {
                notes: actionNotes.trim(),
              }
            : {}),
        },
      );

      const result = response.data as ApiResponse<Assignment>;

      if (!result.success) {
        throw new Error(result.message || "Failed to complete assignment.");
      }

      setModal(null);
      setSelectedAssignment(null);

      setSuccess("Vehicle assignment completed successfully.");

      await Promise.all([loadAssignments(), loadOptions()]);
    } catch (err) {
      console.error("Failed to complete assignment:", err);

      setError(
        err instanceof Error ? err.message : "Failed to complete assignment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAssignment) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.patch(
        `/api/assignments/${selectedAssignment._id}/cancel`,
        {
          ...(actionNotes.trim()
            ? {
                notes: actionNotes.trim(),
              }
            : {}),
        },
      );

      const result = response.data as ApiResponse<Assignment>;

      if (!result.success) {
        throw new Error(result.message || "Failed to cancel assignment.");
      }

      setModal(null);
      setSelectedAssignment(null);

      setSuccess("Vehicle assignment cancelled successfully.");

      await Promise.all([loadAssignments(), loadOptions()]);
    } catch (err) {
      console.error("Failed to cancel assignment:", err);

      setError(
        err instanceof Error ? err.message : "Failed to cancel assignment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getVehicle(vehicleId: string) {
    return vehicles.find((vehicle) => vehicle._id === vehicleId);
  }

  function getDriver(driverId: string) {
    return drivers.find((driver) => driver._id === driverId);
  }

  const viewedAssignment = viewAssignment;

  const viewedTotalDistance =
    viewedAssignment?.endingMileage !== undefined &&
    viewedAssignment?.endingMileage !== null
      ? Math.max(
          0,
          viewedAssignment.endingMileage - viewedAssignment.startingMileage,
        )
      : null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#050b18] dark:text-white">
      <DashboardSidebar />

      <div
        className={`
          min-h-screen
          transition-[padding] duration-300 ease-in-out
          ${collapsed ? "lg:pl-20" : "lg:pl-72"}
        `}
      >
        <DashboardHeader />

        <main className="px-3 pb-10 pt-24 sm:px-5 lg:px-7 xl:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {/* Page Header */}
            <section className="mb-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <ClipboardList className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Fleet Operations
                      </p>

                      <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                        Vehicle Assignments
                      </h1>
                    </div>
                  </div>

                  <p className="max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    Assign available vehicles to drivers, track active
                    assignments, and manage vehicle returns.
                  </p>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      void Promise.all([loadAssignments(), loadOptions()]);
                    }}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:flex-none dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.07]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>

                  {canManageAssignments && (
                    <button
                      type="button"
                      onClick={openAssignModal}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:flex-none"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Assign Vehicle</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Alerts */}
            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="min-w-0 flex-1">{success}</div>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="shrink-0 rounded-lg p-1 transition hover:bg-emerald-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {error && !modal && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="min-w-0 flex-1">{error}</div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 rounded-lg p-1 transition hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Stats */}
            <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-500 sm:text-sm dark:text-zinc-400">
                      Total Assignments
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight">
                      {totalAssignments}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-500 sm:text-sm dark:text-zinc-400">
                      Active Assignments
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight">
                      {activeAssignments}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <Clock3 className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-500 sm:text-sm dark:text-zinc-400">
                      Available Vehicles
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight">
                      {availableVehicles}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="mb-5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search vehicle, registration, driver..."
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as "all" | AssignmentStatus,
                    );

                    setPage(1);
                  }}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-48 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </section>

            {/* Table */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              {loading ? (
                <div className="flex min-h-[420px] items-center justify-center px-6">
                  <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading assignments...
                  </div>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                    <ClipboardList className="h-6 w-6" />
                  </div>

                  <h3 className="text-base font-semibold">
                    No assignments found
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                    {search
                      ? "Try changing your search or filters."
                      : "There are no vehicle assignments to display yet."}
                  </p>

                  {canManageAssignments && (
                    <button
                      type="button"
                      onClick={openAssignModal}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Assign Vehicle
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-white/10 dark:bg-white/[0.02]">
                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6 dark:text-zinc-400">
                            Vehicle
                          </th>

                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6 dark:text-zinc-400">
                            Driver
                          </th>

                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6 dark:text-zinc-400">
                            Assigned
                          </th>

                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6 dark:text-zinc-400">
                            Expected Return
                          </th>

                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6 dark:text-zinc-400">
                            Mileage
                          </th>

                          <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6 dark:text-zinc-400">
                            Status
                          </th>

                          <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6 dark:text-zinc-400">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {filteredAssignments.map((assignment) => {
                          const vehicle = getVehicle(assignment.vehicleId);

                          const driver = getDriver(assignment.driverId);

                          return (
                            <tr
                              key={assignment._id}
                              className="transition hover:bg-zinc-50/70 dark:hover:bg-white/[0.025]"
                            >
                              <td className="px-4 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                    <Truck className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[190px] truncate text-sm font-semibold">
                                      {getVehicleName(vehicle)}
                                    </p>

                                    <p className="mt-0.5 max-w-[190px] truncate text-xs text-zinc-500 dark:text-zinc-400">
                                      {vehicle?.registrationNumber ||
                                        assignment.vehicleId}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-5 sm:px-6">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                                    <UserRound className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[170px] truncate text-sm font-medium">
                                      {getDriverName(driver)}
                                    </p>

                                    {driver?.email && (
                                      <p className="mt-0.5 max-w-[170px] truncate text-xs text-zinc-500 dark:text-zinc-400">
                                        {driver.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-5 sm:px-6">
                                <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                  <CalendarDays className="h-4 w-4 shrink-0 text-zinc-400" />

                                  <span className="whitespace-nowrap">
                                    {formatDate(assignment.assignedAt)}
                                  </span>
                                </div>

                                <p className="mt-1 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                                  {formatDateTime(assignment.assignedAt)}
                                </p>
                              </td>

                              <td className="px-4 py-5 sm:px-6">
                                <span className="whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                                  {formatDate(assignment.expectedReturnDate)}
                                </span>
                              </td>

                              <td className="px-4 py-5 sm:px-6">
                                <div className="text-sm">
                                  <p className="whitespace-nowrap font-medium">
                                    {formatMileage(assignment.startingMileage)}
                                  </p>

                                  <p className="mt-1 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
                                    End:{" "}
                                    {formatMileage(assignment.endingMileage)}
                                  </p>
                                </div>
                              </td>

                              <td className="px-4 py-5 sm:px-6">
                                <span
                                  className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[assignment.status]}`}
                                >
                                  {getStatusLabel(assignment.status)}
                                </span>
                              </td>

                              <td className="px-4 py-5 sm:px-6">
                                <div className="flex justify-end gap-2">
                                  {/* View */}
                                  <button
                                    type="button"
                                    onClick={() => openViewModal(assignment)}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    View
                                  </button>

                                  {/* Manage */}
                                  {canManageAssignments &&
                                    assignment.status === "active" && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openCompleteModal(assignment)
                                          }
                                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          Complete
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            openCancelModal(assignment)
                                          }
                                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
                                        >
                                          <XCircle className="h-3.5 w-3.5" />
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10">
                    <p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
                      Page{" "}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                        {page}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                        {totalPages}
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPage((current) =>
                            Math.min(totalPages, current + 1),
                          )
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* VIEW ASSIGNMENT MODAL */}
      {/* ========================================================= */}
      {modal === "view" && viewedAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1324]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-6 dark:border-white/10">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold">Assignment Details</h2>

                  <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    ID: {viewedAssignment._id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={viewLoading}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span className="min-w-0 flex-1">{error}</span>
                </div>
              )}

              {viewLoading && (
                <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading latest assignment details...
                </div>
              )}

              {/* Status */}
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.03]">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Assignment Status
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[viewedAssignment.status]}`}
                  >
                    {getStatusLabel(viewedAssignment.status)}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Organization
                  </p>

                  <p className="mt-1 max-w-[260px] truncate text-sm font-medium">
                    {viewedAssignment.organizationId}
                  </p>
                </div>
              </div>

              {/* Vehicle + Driver */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Vehicle */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <Truck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Vehicle
                      </p>

                      <p className="text-base font-semibold">
                        {getVehicleName(viewVehicle || undefined)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Registration
                      </span>

                      <span className="max-w-[180px] truncate text-right text-sm font-medium">
                        {viewVehicle?.registrationNumber ||
                          viewedAssignment.vehicleId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Vehicle Status
                      </span>

                      <span className="text-right text-sm font-medium capitalize">
                        {viewVehicle?.status?.replace("_", " ") || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Vehicle ID
                      </span>

                      <span className="max-w-[180px] truncate text-right text-xs text-zinc-600 dark:text-zinc-300">
                        {viewedAssignment.vehicleId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Driver
                      </p>

                      <p className="truncate text-base font-semibold">
                        {getDriverName(viewDriver || undefined)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Email
                      </span>

                      <span className="max-w-[200px] truncate text-right text-sm font-medium">
                        {viewDriver?.email || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Role
                      </span>

                      <span className="text-right text-sm font-medium capitalize">
                        {viewDriver?.role || "Driver"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Driver ID
                      </span>

                      <span className="max-w-[180px] truncate text-right text-xs text-zinc-600 dark:text-zinc-300">
                        {viewedAssignment.driverId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline / Dates */}
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Assignment Timeline
                    </p>

                    <p className="text-base font-semibold">Dates & Times</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Assigned
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(viewedAssignment.assignedAt)}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(viewedAssignment.assignedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Expected Return
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(viewedAssignment.expectedReturnDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Returned
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(viewedAssignment.returnedAt)}
                    </p>

                    {viewedAssignment.returnedAt && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(viewedAssignment.returnedAt)}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Assigned By
                    </p>

                    <p className="mt-1 max-w-[180px] truncate text-sm font-semibold">
                      {viewedAssignment.assignedBy}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mileage */}
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Truck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Mileage
                    </p>

                    <p className="text-base font-semibold">Vehicle Usage</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Starting Mileage
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {formatMileage(viewedAssignment.startingMileage)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Ending Mileage
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {formatMileage(viewedAssignment.endingMileage)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Distance Travelled
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {viewedTotalDistance !== null
                        ? formatMileage(viewedTotalDistance)
                        : "In progress"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Assignment Notes
                </p>

                <div className="mt-2 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-700 dark:bg-white/[0.03] dark:text-zinc-300">
                  {viewedAssignment.notes?.trim()
                    ? viewedAssignment.notes
                    : "No notes were added to this assignment."}
                </div>
              </div>

              {/* Audit information */}
              <div className="mt-4 grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 dark:border-white/10 dark:bg-white/[0.02]">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Created At
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(viewedAssignment.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(viewedAssignment.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-zinc-200 px-5 py-4 dark:border-white/10 sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                disabled={viewLoading}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modal === "assign" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1324]">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-6 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">Assign Vehicle</h2>

                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  Assign an available vehicle to a driver.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span className="min-w-0 flex-1">{error}</span>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Vehicle
                  </label>

                  <select
                    value={selectedVehicleId}
                    onChange={(event) =>
                      setSelectedVehicleId(event.target.value)
                    }
                    disabled={submitting || loadingOptions}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading vehicles..."
                        : "Select vehicle"}
                    </option>

                    {vehicles
                      .filter((vehicle) => vehicle.status === "available")
                      .map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.make} {vehicle.model} —{" "}
                          {vehicle.registrationNumber}
                        </option>
                      ))}
                  </select>

                  {!loadingOptions &&
                    vehicles.filter((vehicle) => vehicle.status === "available")
                      .length === 0 && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        No available vehicles found.
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Driver
                  </label>

                  <select
                    value={selectedDriverId}
                    onChange={(event) =>
                      setSelectedDriverId(event.target.value)
                    }
                    disabled={submitting || loadingOptions}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="">
                      {loadingOptions ? "Loading drivers..." : "Select driver"}
                    </option>

                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {getDriverName(driver)}
                      </option>
                    ))}
                  </select>

                  {!loadingOptions && drivers.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      No drivers found. Make sure the Auth Service exposes the
                      users endpoint.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Starting Mileage
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={startingMileage}
                    onChange={(event) => setStartingMileage(event.target.value)}
                    disabled={submitting}
                    placeholder="e.g. 25000"
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                    km
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Expected Return Date
                  <span className="ml-1 font-normal text-zinc-400">
                    (optional)
                  </span>
                </label>

                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(event) =>
                    setExpectedReturnDate(event.target.value)
                  }
                  disabled={submitting}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Notes
                  <span className="ml-1 font-normal text-zinc-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={submitting}
                  rows={3}
                  maxLength={5000}
                  placeholder="Add assignment notes..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                />

                <p className="mt-1 text-right text-xs text-zinc-400">
                  {notes.length}/5000
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end dark:border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingOptions ||
                    vehicles.filter((vehicle) => vehicle.status === "available")
                      .length === 0 ||
                    drivers.length === 0
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Assign Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {modal === "complete" && selectedAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1324]">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-6 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">Complete Assignment</h2>

                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  Record the vehicle's return mileage.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleComplete} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span className="min-w-0 flex-1">{error}</span>
                </div>
              )}

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Truck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {getVehicleName(getVehicle(selectedAssignment.vehicleId))}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      Starting mileage:{" "}
                      {formatMileage(selectedAssignment.startingMileage)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Ending Mileage
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min={selectedAssignment.startingMileage}
                    step="1"
                    value={endingMileage}
                    onChange={(event) => setEndingMileage(event.target.value)}
                    disabled={submitting}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                    km
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Must be at least{" "}
                  {selectedAssignment.startingMileage.toLocaleString()} km.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Notes
                  <span className="ml-1 font-normal text-zinc-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={actionNotes}
                  onChange={(event) => setActionNotes(event.target.value)}
                  disabled={submitting}
                  rows={3}
                  maxLength={5000}
                  placeholder="Add return notes..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end dark:border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Complete Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {modal === "cancel" && selectedAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1324]">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 sm:px-6 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold">Cancel Assignment</h2>

                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  This will release the vehicle back to the fleet.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCancel} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span className="min-w-0 flex-1">{error}</span>
                </div>
              )}

              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      Are you sure you want to cancel this assignment?
                    </p>

                    <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
                      The assignment will be marked as cancelled and the vehicle
                      will become available again.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm font-semibold">
                  {getVehicleName(getVehicle(selectedAssignment.vehicleId))}
                </p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Assigned to{" "}
                  {getDriverName(getDriver(selectedAssignment.driverId))}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Cancellation Notes
                  <span className="ml-1 font-normal text-zinc-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={actionNotes}
                  onChange={(event) => setActionNotes(event.target.value)}
                  disabled={submitting}
                  rows={3}
                  maxLength={5000}
                  placeholder="Reason for cancellation..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end dark:border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:bg-white/[0.06]"
                >
                  Keep Assignment
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cancel Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
