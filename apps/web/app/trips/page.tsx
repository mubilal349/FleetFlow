"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Filter,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Route,
  Search,
  Trash2,
  Truck,
  UserRound,
  X,
  Play,
  Flag,
  Ban,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const configuredApiBase = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

const API_BASE = /\/api$/i.test(configuredApiBase)
  ? configuredApiBase
  : `${configuredApiBase}/api`;

const TOKEN_KEY = "fleetflow_token";
const PAGE_SIZE = 10;

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

interface Trip {
  _id?: string;
  id?: string;
  organizationId?: string;
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  expectedArrival?: string;
  actualDeparture?: string;
  actualArrival?: string;
  startMileage?: number;
  endMileage?: number;
  notes?: string;
  cancellationReason?: string;
  status: TripStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface DriverOption {
  id: string;
  name: string;
  status?: string;
}

interface VehicleOption {
  id: string;
  name: string;
  status?: string;
}

interface TripFormData {
  driverId: string;
  vehicleId: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  expectedArrival: string;
  notes: string;
}

type ModalType =
  | "create"
  | "edit"
  | "details"
  | "start"
  | "complete"
  | "cancel"
  | "delete"
  | null;

const EMPTY_FORM: TripFormData = {
  driverId: "",
  vehicleId: "",
  origin: "",
  destination: "",
  scheduledDeparture: "",
  expectedArrival: "",
  notes: "",
};

const STATUS_OPTIONS: { value: TripStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function getTripId(trip: Trip): string {
  return String(trip._id || trip.id || "");
}

function normalizeTrip(value: unknown): Trip {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const validStatuses: TripStatus[] = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ];

  const status =
    typeof raw.status === "string" &&
    validStatuses.includes(raw.status as TripStatus)
      ? (raw.status as TripStatus)
      : "scheduled";

  return {
    ...raw,
    _id:
      raw._id !== undefined && raw._id !== null ? String(raw._id) : undefined,
    id: typeof raw.id === "string" ? raw.id : undefined,
    driverId: String(raw.driverId ?? ""),
    vehicleId: String(raw.vehicleId ?? ""),
    origin: typeof raw.origin === "string" ? raw.origin : "",
    destination: typeof raw.destination === "string" ? raw.destination : "",
    scheduledDeparture:
      typeof raw.scheduledDeparture === "string" ? raw.scheduledDeparture : "",
    expectedArrival:
      typeof raw.expectedArrival === "string" ? raw.expectedArrival : undefined,
    actualDeparture:
      typeof raw.actualDeparture === "string" ? raw.actualDeparture : undefined,
    actualArrival:
      typeof raw.actualArrival === "string" ? raw.actualArrival : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    status,
  } as Trip;
}

function getTripList(payload: unknown): Trip[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeTrip);
  }

  if (!payload || typeof payload !== "object") return [];

  const raw = payload as Record<string, unknown>;
  const candidates: unknown[] = [raw.data, raw.trips, raw.results, raw.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeTrip);
    }

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;

      for (const key of ["trips", "results", "items"]) {
        if (Array.isArray(nested[key])) {
          return (nested[key] as unknown[]).map(normalizeTrip);
        }
      }
    }
  }

  if (raw._id || raw.id) return [normalizeTrip(raw)];

  return [];
}

function getLookupList(
  payload: unknown,
  type: "driver" | "vehicle",
): DriverOption[] | VehicleOption[] {
  let items: unknown[] = [];

  if (Array.isArray(payload)) {
    items = payload;
  } else if (payload && typeof payload === "object") {
    const raw = payload as Record<string, unknown>;

    for (const key of [
      type === "driver" ? "drivers" : "vehicles",
      "data",
      "results",
      "items",
    ]) {
      if (Array.isArray(raw[key])) {
        items = raw[key] as unknown[];
        break;
      }

      if (raw[key] && typeof raw[key] === "object") {
        const nested = raw[key] as Record<string, unknown>;
        const nestedKey = type === "driver" ? "drivers" : "vehicles";

        if (Array.isArray(nested[nestedKey])) {
          items = nested[nestedKey] as unknown[];
          break;
        }
      }
    }
  }

  return items
    .map((item) => {
      const raw =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};

      const id = String(raw._id ?? raw.id ?? "");

      if (type === "driver") {
        const name =
          `${String(raw.firstName ?? "")} ${String(raw.lastName ?? "")}`.trim();

        return {
          id,
          name: name || String(raw.name ?? raw.email ?? "Unnamed Driver"),
          status: typeof raw.status === "string" ? raw.status : undefined,
        };
      }

      const registration = String(
        raw.registrationNumber ?? raw.registration ?? "",
      );
      const make = String(raw.make ?? "");
      const model = String(raw.model ?? "");
      const label = [make, model].filter(Boolean).join(" ");

      return {
        id,
        name:
          [registration, label].filter(Boolean).join(" — ") ||
          String(raw.name ?? "Unnamed Vehicle"),
        status: typeof raw.status === "string" ? raw.status : undefined,
      };
    })
    .filter((item) => item.id);
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocal(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
}

function getStatusLabel(status: TripStatus): string {
  const labels: Record<TripStatus, string> = {
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function getStatusClasses(status: TripStatus): string {
  switch (status) {
    case "scheduled":
      return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20";
    case "in_progress":
      return "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/20";
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20";
    case "cancelled":
      return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20";
  }
}

/* -------------------------------------------------------------------------- */
/*                               Reusable UI                                  */
/* -------------------------------------------------------------------------- */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {getStatusLabel(status)}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Route;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Main page                                  */
/* -------------------------------------------------------------------------- */

export default function TripsPage() {
  const { collapsed } = useSidebar();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TripStatus | "all">("all");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState<TripFormData>(EMPTY_FORM);
  const [mileage, setMileage] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  const request = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem(TOKEN_KEY)
          : null;

      const headers = new Headers(options.headers);

      if (token) headers.set("Authorization", `Bearer ${token}`);

      if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      const text = await response.text();
      let payload: unknown = null;

      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = text;
        }
      }

      if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        if (payload && typeof payload === "object") {
          const raw = payload as Record<string, unknown>;
          const nested =
            raw.error && typeof raw.error === "object"
              ? (raw.error as Record<string, unknown>)
              : null;

          if (typeof raw.message === "string") message = raw.message;
          else if (typeof raw.error === "string") message = raw.error;
          else if (nested && typeof nested.message === "string") {
            message = nested.message;
          }
        }

        throw new Error(message);
      }

      return payload;
    },
    [],
  );

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await request("/trips?page=1&limit=100");
      setTrips(getTripList(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trips.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  const fetchLookups = useCallback(async () => {
    setLookupsLoading(true);

    const [driverResult, vehicleResult] = await Promise.allSettled([
      request("/drivers"),
      request("/vehicles?limit=100"),
    ]);

    if (driverResult.status === "fulfilled") {
      setDrivers(getLookupList(driverResult.value, "driver") as DriverOption[]);
    }

    if (vehicleResult.status === "fulfilled") {
      setVehicles(
        getLookupList(vehicleResult.value, "vehicle") as VehicleOption[],
      );
    }

    if (
      driverResult.status === "rejected" ||
      vehicleResult.status === "rejected"
    ) {
      setError(
        "Trips can still be viewed, but driver or vehicle options could not be loaded. Check your API Gateway routes.",
      );
    }

    setLookupsLoading(false);
  }, [request]);

  useEffect(() => {
    void fetchTrips();
    void fetchLookups();
  }, [fetchTrips, fetchLookups]);

  const filteredTrips = useMemo(() => {
    const term = search.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesStatus =
        statusFilter === "all" || trip.status === statusFilter;

      const driver = drivers.find((item) => item.id === trip.driverId);
      const vehicle = vehicles.find((item) => item.id === trip.vehicleId);

      const searchable = [
        trip.origin,
        trip.destination,
        trip.driverId,
        trip.vehicleId,
        driver?.name,
        vehicle?.name,
        trip.status,
      ];

      const matchesSearch =
        !term ||
        searchable.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(term),
        );

      return matchesStatus && matchesSearch;
    });
  }, [trips, search, statusFilter, drivers, vehicles]);

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / PAGE_SIZE));

  const paginatedTrips = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTrips.slice(start, start + PAGE_SIZE);
  }, [filteredTrips, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(
    () => ({
      total: trips.length,
      scheduled: trips.filter((trip) => trip.status === "scheduled").length,
      inProgress: trips.filter((trip) => trip.status === "in_progress").length,
      completed: trips.filter((trip) => trip.status === "completed").length,
    }),
    [trips],
  );

  function clearNotifications() {
    setError("");
    setSuccess("");
  }

  function updateForm<K extends keyof TripFormData>(
    key: K,
    value: TripFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreateModal() {
    clearNotifications();
    setSelectedTrip(null);
    setForm(EMPTY_FORM);
    setModal("create");
  }

  function openEditModal(trip: Trip) {
    clearNotifications();
    setSelectedTrip(trip);
    setForm({
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      origin: trip.origin,
      destination: trip.destination,
      scheduledDeparture: toDateTimeLocal(trip.scheduledDeparture),
      expectedArrival: toDateTimeLocal(trip.expectedArrival),
      notes: trip.notes ?? "",
    });
    setModal("edit");
  }

  function closeModal() {
    if (submitting) return;
    setModal(null);
    setSelectedTrip(null);
    setForm(EMPTY_FORM);
    setMileage("");
    setCancellationReason("");
  }

  function openActionModal(type: ModalType, trip: Trip) {
    clearNotifications();
    setSelectedTrip(trip);
    setMileage("");
    setCancellationReason("");
    setModal(type);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearNotifications();

    if (!form.driverId || !form.vehicleId) {
      setError("Please select both a driver and a vehicle.");
      return;
    }

    if (
      !form.origin.trim() ||
      !form.destination.trim() ||
      !form.scheduledDeparture
    ) {
      setError("Origin, destination, and departure time are required.");
      return;
    }

    const departure = new Date(form.scheduledDeparture);

    if (Number.isNaN(departure.getTime())) {
      setError("Please enter a valid departure date and time.");
      return;
    }

    const arrival = form.expectedArrival
      ? new Date(form.expectedArrival)
      : null;

    if (arrival && (Number.isNaN(arrival.getTime()) || arrival <= departure)) {
      setError("Expected arrival must be later than scheduled departure.");
      return;
    }

    const body = {
      driverId: form.driverId,
      vehicleId: form.vehicleId,
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      scheduledDeparture: departure.toISOString(),
      ...(arrival ? { expectedArrival: arrival.toISOString() } : {}),
      notes: form.notes.trim(),
    };

    setSubmitting(true);

    try {
      if (modal === "edit" && selectedTrip) {
        const id = getTripId(selectedTrip);
        if (!id) throw new Error("The selected trip has no valid ID.");

        await request(`/trips/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });

        setSuccess("Trip updated successfully.");
      } else {
        await request("/trips", {
          method: "POST",
          body: JSON.stringify(body),
        });

        setSuccess("Trip created successfully.");
      }

      setModal(null);
      setSelectedTrip(null);
      setForm(EMPTY_FORM);
      await fetchTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save trip.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTripAction() {
    if (!selectedTrip) return;

    const id = getTripId(selectedTrip);

    if (!id) {
      setError("The selected trip has no valid ID.");
      return;
    }

    clearNotifications();

    let path = "";
    let body: Record<string, unknown> | undefined;
    let method = "PATCH";
    let successMessage = "";

    if (modal === "start") {
      const startMileage = Number(mileage);

      if (
        !mileage.trim() ||
        !Number.isFinite(startMileage) ||
        startMileage < 0
      ) {
        setError("Enter a valid starting mileage of zero or greater.");
        return;
      }

      path = `/trips/${encodeURIComponent(id)}/start`;
      body = { startMileage };
      successMessage = "Trip started successfully.";
    } else if (modal === "complete") {
      const endMileage = Number(mileage);

      if (!mileage.trim() || !Number.isFinite(endMileage) || endMileage < 0) {
        setError("Enter a valid ending mileage of zero or greater.");
        return;
      }

      if (
        selectedTrip.startMileage !== undefined &&
        endMileage < selectedTrip.startMileage
      ) {
        setError("Ending mileage cannot be less than starting mileage.");
        return;
      }

      path = `/trips/${encodeURIComponent(id)}/complete`;
      body = { endMileage };
      successMessage = "Trip completed successfully.";
    } else if (modal === "cancel") {
      path = `/trips/${encodeURIComponent(id)}/cancel`;
      body = { reason: cancellationReason.trim() };
      successMessage = "Trip cancelled successfully.";
    } else if (modal === "delete") {
      path = `/trips/${encodeURIComponent(id)}`;
      method = "DELETE";
      successMessage = "Trip deleted successfully.";
    } else {
      return;
    }

    setSubmitting(true);

    try {
      await request(path, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      setModal(null);
      setSelectedTrip(null);
      setMileage("");
      setCancellationReason("");
      setSuccess(successMessage);
      await fetchTrips();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete the action.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function driverName(id: string): string {
    return drivers.find((driver) => driver.id === id)?.name || id || "—";
  }

  function vehicleName(id: string): string {
    return vehicles.find((vehicle) => vehicle.id === id)?.name || id || "—";
  }

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />

      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
        }`}
      >
        <DashboardHeader />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {/* Page heading */}
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Truck size={16} />
                <span>Fleet Management</span>
                <ChevronRight size={14} />
                <span className="text-slate-700 dark:text-slate-200">
                  Trips
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Trip Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Schedule trips, monitor execution, and manage trip history.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void fetchTrips();
                  void fetchLookups();
                }}
                disabled={loading || lookupsLoading}
                className={secondaryButtonClass}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className={primaryButtonClass}
              >
                <Plus size={17} />
                Create Trip
              </button>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">{success}</div>
              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss success"
                className="rounded-lg p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Trips"
              value={stats.total}
              description="All registered trips"
              icon={Route}
              iconClass="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
            />
            <StatCard
              title="Scheduled"
              value={stats.scheduled}
              description="Awaiting departure"
              icon={CalendarDays}
              iconClass="bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400"
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              description="Currently on the road"
              icon={Truck}
              iconClass="bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              description="Successfully completed trips"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
            />
          </div>

          {/* Trips table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Trips
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {filteredTrips.length}{" "}
                    {filteredTrips.length === 1 ? "trip" : "trips"} found
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 sm:w-72">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search route, driver, vehicle..."
                      className={`${inputClass} pl-9`}
                      aria-label="Search trips"
                    />
                  </div>

                  <div className="relative sm:w-48">
                    <Filter
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value as TripStatus | "all",
                        )
                      }
                      className={`${inputClass} appearance-none pl-9 pr-9`}
                      aria-label="Filter trips by status"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Route</th>
                    <th className="px-5 py-4 font-semibold">Driver</th>
                    <th className="px-5 py-4 font-semibold">Vehicle</th>
                    <th className="px-5 py-4 font-semibold">Departure</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading && trips.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Loader2
                          size={25}
                          className="mx-auto animate-spin text-blue-600"
                        />
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                          Loading trips...
                        </p>
                      </td>
                    </tr>
                  ) : paginatedTrips.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Route size={28} className="mx-auto text-slate-400" />
                        <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                          No trips found
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Change your filters or create a new trip.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTrips.map((trip) => {
                      const id = getTripId(trip);

                      return (
                        <tr
                          key={id || `${trip.origin}-${trip.destination}`}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                                <Route size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-[260px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {trip.origin || "Unknown origin"}
                                </p>
                                <p className="mt-1 flex max-w-[260px] items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                  <MapPin size={12} />
                                  {trip.destination || "Unknown destination"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <UserRound
                                size={15}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="max-w-[180px] truncate">
                                {driverName(trip.driverId)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Truck
                                size={15}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="max-w-[190px] truncate">
                                {vehicleName(trip.vehicleId)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Clock
                                size={14}
                                className="shrink-0 text-slate-400"
                              />
                              {formatDate(trip.scheduledDeparture)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={trip.status} />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="View trip"
                                aria-label="View trip details"
                                onClick={() => {
                                  setSelectedTrip(trip);
                                  setModal("details");
                                }}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                              >
                                <Eye size={17} />
                              </button>

                              {trip.status === "scheduled" && (
                                <>
                                  <button
                                    type="button"
                                    title="Edit trip"
                                    aria-label="Edit trip"
                                    onClick={() => openEditModal(trip)}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                                  >
                                    <Edit size={17} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Start trip"
                                    aria-label="Start trip"
                                    onClick={() =>
                                      openActionModal("start", trip)
                                    }
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-400"
                                  >
                                    <Play size={17} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Cancel trip"
                                    aria-label="Cancel trip"
                                    onClick={() =>
                                      openActionModal("cancel", trip)
                                    }
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-400/10 dark:hover:text-amber-400"
                                  >
                                    <Ban size={17} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete trip"
                                    aria-label="Delete trip"
                                    onClick={() =>
                                      openActionModal("delete", trip)
                                    }
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10 dark:hover:text-red-400"
                                  >
                                    <Trash2 size={17} />
                                  </button>
                                </>
                              )}

                              {trip.status === "in_progress" && (
                                <button
                                  type="button"
                                  title="Complete trip"
                                  aria-label="Complete trip"
                                  onClick={() =>
                                    openActionModal("complete", trip)
                                  }
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-400"
                                >
                                  <Flag size={17} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
              {loading && trips.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Loader2
                    size={25}
                    className="mx-auto animate-spin text-blue-600"
                  />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Loading trips...
                  </p>
                </div>
              ) : paginatedTrips.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Route size={26} className="mx-auto text-slate-400" />
                  <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                    No trips found
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Change your filters or create a new trip.
                  </p>
                </div>
              ) : (
                paginatedTrips.map((trip) => (
                  <article key={getTripId(trip)} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                        <Route size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold text-slate-900 dark:text-white">
                          {trip.origin} → {trip.destination}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(trip.scheduledDeparture)}
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={trip.status} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTrip(trip);
                          setModal("details");
                        }}
                        aria-label="View trip details"
                        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                      >
                        <Eye size={17} />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Driver
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                          {driverName(trip.driverId)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Vehicle
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                          {vehicleName(trip.vehicleId)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {trip.status === "scheduled" && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(trip)}
                            className={secondaryButtonClass}
                          >
                            <Edit size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal("start", trip)}
                            className={primaryButtonClass}
                          >
                            <Play size={15} />
                            Start
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal("cancel", trip)}
                            className={secondaryButtonClass}
                          >
                            <Ban size={15} />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal("delete", trip)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </>
                      )}

                      {trip.status === "in_progress" && (
                        <button
                          type="button"
                          onClick={() => openActionModal("complete", trip)}
                          className={primaryButtonClass}
                        >
                          <Flag size={15} />
                          Complete Trip
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredTrips.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                  {"–"}
                  {Math.min(page * PAGE_SIZE, filteredTrips.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredTrips.length}
                </span>{" "}
                trips
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className={secondaryButtonClass}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="min-w-20 text-center text-sm text-slate-500 dark:text-slate-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                  className={secondaryButtonClass}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Create / Edit modal */}
      {(modal === "create" || modal === "edit") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-form-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div>
                <h2
                  id="trip-form-title"
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  {modal === "edit" ? "Edit Trip" : "Create New Trip"}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Enter the trip route, driver, vehicle, and schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close trip form"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid max-h-[65vh] grid-cols-1 gap-5 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6">
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Assignment
                  </p>
                </div>

                <Field label="Driver" required>
                  <select
                    className={inputClass}
                    value={form.driverId}
                    onChange={(event) =>
                      updateForm("driverId", event.target.value)
                    }
                    required
                    disabled={lookupsLoading}
                  >
                    <option value="">
                      {lookupsLoading
                        ? "Loading drivers..."
                        : "Select a driver"}
                    </option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                        {driver.status
                          ? ` (${driver.status.replace(/_/g, " ")})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Vehicle" required>
                  <select
                    className={inputClass}
                    value={form.vehicleId}
                    onChange={(event) =>
                      updateForm("vehicleId", event.target.value)
                    }
                    required
                    disabled={lookupsLoading}
                  >
                    <option value="">
                      {lookupsLoading
                        ? "Loading vehicles..."
                        : "Select a vehicle"}
                    </option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                        {vehicle.status
                          ? ` (${vehicle.status.replace(/_/g, " ")})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="sm:col-span-2 mt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Route information
                  </p>
                </div>

                <Field label="Origin" required>
                  <input
                    className={inputClass}
                    value={form.origin}
                    onChange={(event) =>
                      updateForm("origin", event.target.value)
                    }
                    placeholder="e.g. Lahore"
                    required
                  />
                </Field>

                <Field label="Destination" required>
                  <input
                    className={inputClass}
                    value={form.destination}
                    onChange={(event) =>
                      updateForm("destination", event.target.value)
                    }
                    placeholder="e.g. Islamabad"
                    required
                  />
                </Field>

                <Field label="Scheduled departure" required>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.scheduledDeparture}
                    onChange={(event) =>
                      updateForm("scheduledDeparture", event.target.value)
                    }
                    required
                  />
                </Field>

                <Field label="Expected arrival">
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.expectedArrival}
                    onChange={(event) =>
                      updateForm("expectedArrival", event.target.value)
                    }
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Notes">
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      value={form.notes}
                      onChange={(event) =>
                        updateForm("notes", event.target.value)
                      }
                      placeholder="Optional trip instructions or notes"
                      rows={3}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || lookupsLoading}
                  className={primaryButtonClass}
                >
                  {submitting ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Check size={17} />
                  )}
                  {submitting
                    ? "Saving..."
                    : modal === "edit"
                      ? "Save Changes"
                      : "Create Trip"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Trip details modal */}
      {modal === "details" && selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-details-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div>
                <h2
                  id="trip-details-title"
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  Trip Details
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review route, assignment, and trip progress.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close trip details"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-400/10">
                <div className="flex items-start gap-3">
                  <Route
                    size={22}
                    className="mt-1 shrink-0 text-blue-600 dark:text-blue-400"
                  />
                  <div className="min-w-0">
                    <p className="break-words text-lg font-bold text-slate-900 dark:text-white">
                      {selectedTrip.origin} → {selectedTrip.destination}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={selectedTrip.status} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Driver", driverName(selectedTrip.driverId)],
                  ["Vehicle", vehicleName(selectedTrip.vehicleId)],
                  [
                    "Scheduled departure",
                    formatDate(selectedTrip.scheduledDeparture),
                  ],
                  [
                    "Expected arrival",
                    formatDate(selectedTrip.expectedArrival),
                  ],
                  [
                    "Actual departure",
                    formatDate(selectedTrip.actualDeparture),
                  ],
                  ["Actual arrival", formatDate(selectedTrip.actualArrival)],
                  [
                    "Starting mileage",
                    selectedTrip.startMileage !== undefined
                      ? `${selectedTrip.startMileage}`
                      : "—",
                  ],
                  [
                    "Ending mileage",
                    selectedTrip.endMileage !== undefined
                      ? `${selectedTrip.endMileage}`
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {selectedTrip.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-300">
                    {selectedTrip.notes}
                  </p>
                </div>
              )}

              {selectedTrip.cancellationReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                    Cancellation reason
                  </p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {selectedTrip.cancellationReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-5 dark:border-slate-800">
              {selectedTrip.status === "scheduled" && (
                <>
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedTrip)}
                    className={secondaryButtonClass}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openActionModal("start", selectedTrip)}
                    className={primaryButtonClass}
                  >
                    <Play size={16} />
                    Start Trip
                  </button>
                </>
              )}
              {selectedTrip.status === "in_progress" && (
                <button
                  type="button"
                  onClick={() => openActionModal("complete", selectedTrip)}
                  className={primaryButtonClass}
                >
                  <Flag size={16} />
                  Complete Trip
                </button>
              )}
              <button
                type="button"
                onClick={closeModal}
                className={secondaryButtonClass}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Start / Complete / Cancel / Delete confirmation modal */}
      {["start", "complete", "cancel", "delete"].includes(modal ?? "") &&
        selectedTrip && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="trip-action-title"
              className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="p-5 sm:p-6">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    modal === "delete" || modal === "cancel"
                      ? "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
                  }`}
                >
                  {modal === "start" && <Play size={22} />}
                  {modal === "complete" && <Flag size={22} />}
                  {modal === "cancel" && <Ban size={22} />}
                  {modal === "delete" && <Trash2 size={22} />}
                </div>

                <h2
                  id="trip-action-title"
                  className="mt-4 text-lg font-bold text-slate-900 dark:text-white"
                >
                  {modal === "start" && "Start this trip?"}
                  {modal === "complete" && "Complete this trip?"}
                  {modal === "cancel" && "Cancel this trip?"}
                  {modal === "delete" && "Delete this trip?"}
                </h2>

                <p className="mt-2 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTrip.origin} → {selectedTrip.destination}
                  </span>
                  {modal === "start" &&
                    " — Enter the vehicle's current odometer reading to begin."}
                  {modal === "complete" &&
                    " — Enter the final odometer reading to complete the trip."}
                  {modal === "cancel" &&
                    " — The scheduled trip will be marked as cancelled."}
                  {modal === "delete" &&
                    " — This permanently deletes the scheduled trip."}
                </p>

                {(modal === "start" || modal === "complete") && (
                  <div className="mt-5">
                    <Field
                      label={
                        modal === "start"
                          ? "Starting mileage"
                          : "Ending mileage"
                      }
                      required
                    >
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className={inputClass}
                        value={mileage}
                        onChange={(event) => setMileage(event.target.value)}
                        placeholder="Enter odometer reading"
                        required
                      />
                    </Field>

                    {modal === "complete" &&
                      selectedTrip.startMileage !== undefined && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Starting mileage: {selectedTrip.startMileage}
                        </p>
                      )}
                  </div>
                )}

                {modal === "cancel" && (
                  <div className="mt-5">
                    <Field label="Cancellation reason">
                      <textarea
                        className={`${inputClass} min-h-20 resize-y`}
                        value={cancellationReason}
                        onChange={(event) =>
                          setCancellationReason(event.target.value)
                        }
                        placeholder="Optional reason for cancellation"
                        rows={3}
                      />
                    </Field>
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className={secondaryButtonClass}
                  >
                    Keep Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleTripAction()}
                    disabled={submitting}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      modal === "delete" || modal === "cancel"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Check size={17} />
                    )}
                    {submitting
                      ? "Processing..."
                      : modal === "start"
                        ? "Start Trip"
                        : modal === "complete"
                          ? "Complete Trip"
                          : modal === "cancel"
                            ? "Confirm Cancellation"
                            : "Delete Trip"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
    </div>
  );
}
