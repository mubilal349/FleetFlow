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
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardList,
  Download,
  Eye,
  Filter,
  Flag,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Route,
  Search,
  Truck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import jsPDF from "jspdf";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";

const configuredApiBase = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");
const API_BASE = /\/api$/i.test(configuredApiBase)
  ? configuredApiBase
  : `${configuredApiBase}/api`;
const TOKEN_KEY = "fleetflow_token";
const PAGE_SIZE = 10;

type DispatchStatus =
  | "pending"
  | "assigned"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "cancelled";
type FilterStatus = DispatchStatus | "all";

interface Dispatch {
  _id?: string;
  id?: string;
  organizationId?: string;
  tripId: string;
  vehicleId: string | null;
  driverId: string | null;
  assignmentId: string | null;
  status: DispatchStatus;
  scheduledAt: string | null;
  dispatchedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  cancellationReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
interface TripOption {
  id: string;
  label: string;
  status?: string;
}
interface VehicleOption {
  id: string;
  name: string;
  status?: string;
}
interface DriverOption {
  id: string;
  name: string;
  status?: string;
}
interface DispatchForm {
  tripId: string;
  vehicleId: string;
  driverId: string;
  scheduledAt: string;
  notes: string;
}
type ModalType = "create" | "details" | "assign" | "cancel" | null;

const EMPTY_FORM: DispatchForm = {
  tripId: "",
  vehicleId: "",
  driverId: "",
  scheduledAt: "",
  notes: "",
};
const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "dispatched", label: "Dispatched" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function getDispatchId(dispatch: Dispatch): string {
  return String(dispatch._id || dispatch.id || "");
}

function normalizeDispatch(value: unknown): Dispatch {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const statuses: DispatchStatus[] = [
    "pending",
    "assigned",
    "dispatched",
    "in_progress",
    "completed",
    "cancelled",
  ];
  const status =
    typeof raw.status === "string" &&
    statuses.includes(raw.status as DispatchStatus)
      ? (raw.status as DispatchStatus)
      : "pending";

  return {
    ...raw,
    _id: raw._id != null ? String(raw._id) : undefined,
    id: raw.id != null ? String(raw.id) : undefined,
    tripId: String(raw.tripId ?? ""),
    vehicleId: raw.vehicleId ? String(raw.vehicleId) : null,
    driverId: raw.driverId ? String(raw.driverId) : null,
    assignmentId: raw.assignmentId ? String(raw.assignmentId) : null,
    status,
    scheduledAt: typeof raw.scheduledAt === "string" ? raw.scheduledAt : null,
    dispatchedAt:
      typeof raw.dispatchedAt === "string" ? raw.dispatchedAt : null,
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : null,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : null,
    notes: typeof raw.notes === "string" ? raw.notes : null,
    cancellationReason:
      typeof raw.cancellationReason === "string"
        ? raw.cancellationReason
        : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  } as Dispatch;
}

function getDispatchList(payload: unknown): Dispatch[] {
  if (Array.isArray(payload)) return payload.map(normalizeDispatch);
  if (!payload || typeof payload !== "object") return [];
  const raw = payload as Record<string, unknown>;

  for (const key of ["data", "dispatches", "results", "items"]) {
    const candidate = raw[key];
    if (Array.isArray(candidate)) return candidate.map(normalizeDispatch);
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      for (const nestedKey of ["dispatches", "results", "items"]) {
        if (Array.isArray(nested[nestedKey])) {
          return (nested[nestedKey] as unknown[]).map(normalizeDispatch);
        }
      }
    }
  }
  return raw._id || raw.id ? [normalizeDispatch(raw)] : [];
}

function getOptions(
  payload: unknown,
  type: "trip" | "driver" | "vehicle",
): Array<TripOption | DriverOption | VehicleOption> {
  let items: unknown[] = [];
  if (Array.isArray(payload)) {
    items = payload;
  } else if (payload && typeof payload === "object") {
    const raw = payload as Record<string, unknown>;
    const keys =
      type === "trip"
        ? ["trips", "data", "results", "items"]
        : type === "driver"
          ? ["drivers", "data", "results", "items"]
          : ["vehicles", "data", "results", "items"];
    for (const key of keys) {
      const candidate = raw[key];
      if (Array.isArray(candidate)) {
        items = candidate;
        break;
      }
      if (candidate && typeof candidate === "object") {
        const nested = candidate as Record<string, unknown>;
        const nestedKey =
          type === "trip"
            ? "trips"
            : type === "driver"
              ? "drivers"
              : "vehicles";
        if (Array.isArray(nested[nestedKey])) {
          items = nested[nestedKey] as unknown[];
          break;
        }
      }
    }
  }

  return items
    .map((item): TripOption | DriverOption | VehicleOption | null => {
      const raw =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
      const id = String(raw._id ?? raw.id ?? "");
      if (!id) return null;
      const status = typeof raw.status === "string" ? raw.status : undefined;

      if (type === "trip") {
        const origin = String(raw.origin ?? "");
        const destination = String(raw.destination ?? "");
        return {
          id,
          label: [origin, destination].filter(Boolean).join(" → ") || id,
          status,
        };
      }
      if (type === "driver") {
        const name =
          `${String(raw.firstName ?? "")} ${String(raw.lastName ?? "")}`.trim();
        return {
          id,
          name: name || String(raw.name ?? raw.email ?? id),
          status,
        };
      }
      const registration = String(
        raw.registrationNumber ?? raw.registration ?? "",
      );
      const name = [String(raw.make ?? ""), String(raw.model ?? "")]
        .filter(Boolean)
        .join(" ");
      return {
        id,
        name: [registration, name].filter(Boolean).join(" — ") || id,
        status,
      };
    })
    .filter(
      (item): item is TripOption | DriverOption | VehicleOption =>
        item !== null,
    );
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

function statusLabel(status: DispatchStatus): string {
  const labels: Record<DispatchStatus, string> = {
    pending: "Pending",
    assigned: "Assigned",
    dispatched: "Dispatched",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}

function statusClasses(status: DispatchStatus): string {
  const styles: Record<DispatchStatus, string> = {
    pending:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20",
    assigned:
      "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20",
    dispatched:
      "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/20",
    in_progress:
      "bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:ring-cyan-400/20",
    completed:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
    cancelled:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
  };
  return styles[status];
}

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

function StatusBadge({ status }: { status: DispatchStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(status)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
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
  icon: LucideIcon;
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

export default function DispatchPage() {
  const { collapsed } = useSidebar();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null,
  );
  const [form, setForm] = useState<DispatchForm>(EMPTY_FORM);
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
      const responseText = await response.text();
      let payload: unknown = null;
      if (responseText) {
        try {
          payload = JSON.parse(responseText);
        } catch {
          payload = responseText;
        }
      }
      if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        if (payload && typeof payload === "object") {
          const raw = payload as Record<string, unknown>;
          if (typeof raw.message === "string") message = raw.message;
          else if (typeof raw.error === "string") message = raw.error;
        }
        throw new Error(message);
      }
      return payload;
    },
    [],
  );

  const fetchDispatches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDispatches(
        getDispatchList(await request("/dispatches?page=1&limit=100")),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dispatches.",
      );
    } finally {
      setLoading(false);
    }
  }, [request]);

  const fetchLookups = useCallback(async () => {
    setLookupsLoading(true);
    const results = await Promise.allSettled([
      request("/trips?page=1&limit=100"),
      request("/drivers"),
      request("/vehicles?limit=100"),
    ]);

    if (results[0].status === "fulfilled") {
      function extractTrips(value: unknown, depth = 0): unknown[] {
        if (depth > 4 || !value || typeof value !== "object") return [];
        if (Array.isArray(value)) return value;
        const record = value as Record<string, unknown>;
        for (const key of ["trips", "data", "results", "items"]) {
          const candidate = record[key];
          if (Array.isArray(candidate)) return candidate;
          if (candidate && typeof candidate === "object") {
            const nested = extractTrips(candidate, depth + 1);
            if (nested.length) return nested;
          }
        }
        return record._id || record.id ? [record] : [];
      }

      const parsedTrips = extractTrips(results[0].value)
        .map((value): TripOption | null => {
          if (!value || typeof value !== "object") return null;
          const raw = value as Record<string, unknown>;
          const id = String(raw._id ?? raw.id ?? "");
          if (!id) return null;
          return {
            id,
            label:
              [String(raw.origin ?? ""), String(raw.destination ?? "")]
                .filter(Boolean)
                .join(" → ") || `Trip ${id}`,
            status: typeof raw.status === "string" ? raw.status : undefined,
          };
        })
        .filter((trip): trip is TripOption => trip !== null);
      setTrips(parsedTrips);
      if (!parsedTrips.length) {
        console.warn(
          "No trips were found in the API response:",
          results[0].value,
        );
      }
    }
    if (results[1].status === "fulfilled") {
      setDrivers(getOptions(results[1].value, "driver") as DriverOption[]);
    }
    if (results[2].status === "fulfilled") {
      setVehicles(getOptions(results[2].value, "vehicle") as VehicleOption[]);
    }
    if (results.some((result) => result.status === "rejected")) {
      setError(
        "Some trip, driver, or vehicle options could not be loaded. Check the corresponding API Gateway routes.",
      );
    }
    setLookupsLoading(false);
  }, [request]);

  useEffect(() => {
    void fetchDispatches();
    void fetchLookups();
  }, [fetchDispatches, fetchLookups]);

  const filteredDispatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return dispatches.filter((dispatch) => {
      const matchesStatus =
        statusFilter === "all" || dispatch.status === statusFilter;
      const searchable = [
        getDispatchId(dispatch),
        dispatch.tripId,
        dispatch.vehicleId,
        dispatch.driverId,
        dispatch.status,
      ];
      return (
        matchesStatus &&
        (!term ||
          searchable.some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(term),
          ))
      );
    });
  }, [dispatches, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDispatches.length / PAGE_SIZE),
  );
  const paginatedDispatches = useMemo(
    () => filteredDispatches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredDispatches, page],
  );

  useEffect(() => setPage(1), [search, statusFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stats = useMemo(
    () => ({
      total: dispatches.length,
      pending: dispatches.filter((item) => item.status === "pending").length,
      active: dispatches.filter((item) =>
        ["assigned", "dispatched", "in_progress"].includes(item.status),
      ).length,
      completed: dispatches.filter((item) => item.status === "completed")
        .length,
    }),
    [dispatches],
  );

  function clearNotifications() {
    setError("");
    setSuccess("");
  }
  function updateForm<K extends keyof DispatchForm>(
    key: K,
    value: DispatchForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function openCreateModal() {
    clearNotifications();
    setSelectedDispatch(null);
    setForm(EMPTY_FORM);
    setModal("create");
  }
  function openAssignModal(dispatch: Dispatch) {
    clearNotifications();
    setSelectedDispatch(dispatch);
    setForm({
      ...EMPTY_FORM,
      tripId: dispatch.tripId,
      vehicleId: dispatch.vehicleId ?? "",
      driverId: dispatch.driverId ?? "",
      scheduledAt: dispatch.scheduledAt
        ? dispatch.scheduledAt.slice(0, 16)
        : "",
      notes: dispatch.notes ?? "",
    });
    setModal("assign");
  }
  function closeModal() {
    if (submitting) return;
    setModal(null);
    setSelectedDispatch(null);
    setForm(EMPTY_FORM);
    setCancellationReason("");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearNotifications();
    if (!form.tripId) {
      setError("Please select a trip.");
      return;
    }
    if (Boolean(form.vehicleId) !== Boolean(form.driverId)) {
      setError("Select both a vehicle and a driver, or leave both unassigned.");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = { tripId: form.tripId };
      if (form.vehicleId) body.vehicleId = form.vehicleId;
      if (form.driverId) body.driverId = form.driverId;
      if (form.scheduledAt)
        body.scheduledAt = new Date(form.scheduledAt).toISOString();
      if (form.notes.trim()) body.notes = form.notes.trim();
      await request("/dispatches", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setModal(null);
      setForm(EMPTY_FORM);
      setSuccess("Dispatch created successfully.");
      await fetchDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create dispatch.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDispatch) return;
    if (!form.vehicleId || !form.driverId) {
      setError("Please select both a vehicle and a driver.");
      return;
    }
    const id = getDispatchId(selectedDispatch);
    if (!id) {
      setError("The selected dispatch has no valid ID.");
      return;
    }
    clearNotifications();
    setSubmitting(true);
    try {
      await request(`/dispatches/${encodeURIComponent(id)}/assign`, {
        method: "POST",
        body: JSON.stringify({
          vehicleId: form.vehicleId,
          driverId: form.driverId,
        }),
      });
      setModal(null);
      setSelectedDispatch(null);
      setSuccess("Vehicle and driver assigned successfully.");
      await fetchDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign dispatch.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusAction(
    dispatch: Dispatch,
    action: "dispatch" | "start" | "complete" | "cancel",
  ) {
    const id = getDispatchId(dispatch);
    if (!id) {
      setError("The selected dispatch has no valid ID.");
      return;
    }
    clearNotifications();
    if (action === "cancel") {
      setSelectedDispatch(dispatch);
      setCancellationReason("");
      setModal("cancel");
      return;
    }
    const confirmations = {
      dispatch: "Dispatch this vehicle now?",
      start: "Start this dispatch?",
      complete: "Mark this dispatch as completed?",
      cancel: "Cancel this dispatch?",
    };
    if (!window.confirm(confirmations[action])) return;
    setBusyId(id);
    try {
      await request(`/dispatches/${encodeURIComponent(id)}/${action}`, {
        method: "POST",
      });
      setSuccess(`Dispatch ${action} action completed successfully.`);
      await fetchDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update dispatch.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDispatch) return;
    if (cancellationReason.trim().length < 3) {
      setError(
        "Please provide a cancellation reason of at least 3 characters.",
      );
      return;
    }
    const id = getDispatchId(selectedDispatch);
    if (!id) {
      setError("The selected dispatch has no valid ID.");
      return;
    }
    setSubmitting(true);
    clearNotifications();
    try {
      await request(`/dispatches/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: cancellationReason.trim() }),
      });
      setModal(null);
      setSelectedDispatch(null);
      setCancellationReason("");
      setSuccess("Dispatch cancelled successfully.");
      await fetchDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel dispatch.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function tripName(id: string) {
    return trips.find((trip) => trip.id === id)?.label || id || "—";
  }
  function driverName(id: string | null) {
    return (
      drivers.find((driver) => driver.id === id)?.name || id || "Unassigned"
    );
  }
  function vehicleName(id: string | null) {
    return (
      vehicles.find((vehicle) => vehicle.id === id)?.name || id || "Unassigned"
    );
  }

  function downloadDispatchPdf(dispatch: Dispatch) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    const dispatchId = getDispatchId(dispatch) || "unknown";
    const generatedAt = new Date().toLocaleString("en-GB");
    let y = 20;

    function ensureSpace(requiredHeight: number) {
      if (y + requiredHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    }
    function addSectionHeading(title: string) {
      ensureSpace(14);
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 64, 175);
      doc.text(title, margin + 3, y + 1);
      y += 13;
    }
    function addField(label: string, value: string) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      const labelLines = doc.splitTextToSize(label, 48);
      doc.setFont("helvetica", "normal");
      const valueLines = doc.splitTextToSize(value || "—", contentWidth - 56);
      const fieldHeight =
        Math.max(labelLines.length, valueLines.length) * 5 + 4;
      ensureSpace(fieldHeight);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text(labelLines, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(valueLines, margin + 56, y);
      y += fieldHeight;
    }
    function addNotesSection(title: string, value: string | null | undefined) {
      if (!value?.trim()) return;
      addSectionHeading(title);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(value.trim(), contentWidth);
      const lineHeight = 5;
      let offset = 0;
      while (offset < lines.length) {
        ensureSpace(lineHeight + 2);
        const availableLines = Math.max(
          1,
          Math.floor((pageHeight - 20 - y) / lineHeight),
        );
        const chunk = lines.slice(offset, offset + availableLines);
        doc.text(chunk, margin, y);
        y += chunk.length * lineHeight + 3;
        offset += chunk.length;
        if (offset < lines.length) {
          doc.addPage();
          y = 20;
        }
      }
      y += 2;
    }

    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("FleetFlow", margin + 5, y + 10);
    doc.setFontSize(11);
    doc.text("Dispatch Details Report", margin + 5, y + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Generated: ${generatedAt}`, pageWidth - margin - 5, y + 24, {
      align: "right",
    });
    y += 38;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`Dispatch #${dispatchId.slice(-8)}`, margin, y);
    y += 8;
    const statusColors: Record<DispatchStatus, [number, number, number]> = {
      pending: [180, 83, 9],
      assigned: [29, 78, 216],
      dispatched: [109, 40, 217],
      in_progress: [8, 145, 178],
      completed: [4, 120, 87],
      cancelled: [185, 28, 28],
    };
    const [red, green, blue] = statusColors[dispatch.status];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(red, green, blue);
    doc.text(`Status: ${statusLabel(dispatch.status)}`, margin, y);
    y += 9;

    addSectionHeading("Dispatch Information");
    addField("Dispatch ID", dispatchId);
    addField("Trip", tripName(dispatch.tripId));
    addField("Trip ID", dispatch.tripId);
    addField("Vehicle", vehicleName(dispatch.vehicleId));
    addField("Vehicle ID", dispatch.vehicleId || "Unassigned");
    addField("Driver", driverName(dispatch.driverId));
    addField("Driver ID", dispatch.driverId || "Unassigned");
    addField("Assignment ID", dispatch.assignmentId || "—");
    addField("Scheduled", formatDate(dispatch.scheduledAt));

    addSectionHeading("Dispatch Timeline");
    addField("Dispatched At", formatDate(dispatch.dispatchedAt));
    addField("Started At", formatDate(dispatch.startedAt));
    addField("Completed At", formatDate(dispatch.completedAt));
    addField("Created At", formatDate(dispatch.createdAt));
    addField("Last Updated", formatDate(dispatch.updatedAt));
    addNotesSection("Dispatch Notes", dispatch.notes);
    addNotesSection("Cancellation Reason", dispatch.cancellationReason);

    const pageCount = doc.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      doc.setPage(pageNumber);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("FleetFlow | Dispatch Management", margin, pageHeight - 8);
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 8,
        {
          align: "right",
        },
      );
    }
    doc.save(`FleetFlow-Dispatch-${dispatchId}.pdf`);
  }

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
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Truck size={16} />
                <span>Fleet Management</span>
                <ChevronRight size={14} />
                <span className="text-slate-700 dark:text-slate-200">
                  Dispatch
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Dispatch Management
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Assign vehicles and drivers, coordinate dispatches, and monitor
                trip execution.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void fetchDispatches();
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
                Create Dispatch
              </button>
            </div>
          </div>

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

          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Dispatches"
              value={stats.total}
              description="All registered dispatches"
              icon={ClipboardList}
              iconClass="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              description="Awaiting assignment"
              icon={Clock}
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
            />
            <StatCard
              title="Active"
              value={stats.active}
              description="Assigned or underway"
              icon={Truck}
              iconClass="bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400"
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              description="Successfully completed"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Dispatch Records
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {filteredDispatches.length}{" "}
                    {filteredDispatches.length === 1
                      ? "dispatch"
                      : "dispatches"}{" "}
                    found
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
                      placeholder="Search trip, driver, or vehicle..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <Filter
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value as FilterStatus)
                      }
                      className={`${inputClass} pl-9 sm:w-48`}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 p-14 text-sm text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                Loading dispatch records...
              </div>
            ) : filteredDispatches.length === 0 ? (
              <div className="p-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Route size={26} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                  No dispatches found
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create a dispatch or change your search and filters.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className={`${primaryButtonClass} mt-5`}
                >
                  <Plus size={16} />
                  Create Dispatch
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60">
                      <tr>
                        <th className="px-5 py-4">Dispatch / Trip</th>
                        <th className="px-5 py-4">Vehicle</th>
                        <th className="px-5 py-4">Driver</th>
                        <th className="px-5 py-4">Scheduled</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedDispatches.map((dispatch) => {
                        const id = getDispatchId(dispatch);
                        const busy = busyId === id;
                        return (
                          <tr
                            key={id || dispatch.tripId}
                            className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {id ? `#${id.slice(-8)}` : "—"}
                              </p>
                              <p className="mt-1 max-w-56 truncate text-xs text-slate-500 dark:text-slate-400">
                                {tripName(dispatch.tripId)}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Truck
                                  size={16}
                                  className="shrink-0 text-slate-400"
                                />
                                <span className="max-w-44 truncate text-slate-700 dark:text-slate-300">
                                  {vehicleName(dispatch.vehicleId)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <UserRound
                                  size={16}
                                  className="shrink-0 text-slate-400"
                                />
                                <span className="max-w-40 truncate text-slate-700 dark:text-slate-300">
                                  {driverName(dispatch.driverId)}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                              {formatDate(dispatch.scheduledAt)}
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={dispatch.status} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  title="View details"
                                  onClick={() => {
                                    clearNotifications();
                                    setSelectedDispatch(dispatch);
                                    setModal("details");
                                  }}
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  type="button"
                                  title="Download dispatch PDF"
                                  aria-label={`Download PDF for dispatch ${id}`}
                                  onClick={() => downloadDispatchPdf(dispatch)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
                                >
                                  <Download size={15} />
                                  <span>PDF</span>
                                </button>
                                {["pending", "assigned"].includes(
                                  dispatch.status,
                                ) && (
                                  <button
                                    type="button"
                                    title="Assign vehicle and driver"
                                    onClick={() => openAssignModal(dispatch)}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10"
                                  >
                                    <UserRound size={16} />
                                  </button>
                                )}
                                {dispatch.status === "assigned" && (
                                  <button
                                    type="button"
                                    title="Dispatch vehicle"
                                    disabled={busy}
                                    onClick={() =>
                                      void handleStatusAction(
                                        dispatch,
                                        "dispatch",
                                      )
                                    }
                                    className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50 disabled:opacity-50 dark:hover:bg-violet-400/10"
                                  >
                                    {busy ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Flag size={16} />
                                    )}
                                  </button>
                                )}
                                {dispatch.status === "dispatched" && (
                                  <button
                                    type="button"
                                    title="Start dispatch"
                                    disabled={busy}
                                    onClick={() =>
                                      void handleStatusAction(dispatch, "start")
                                    }
                                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-400/10"
                                  >
                                    {busy ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Play size={16} />
                                    )}
                                  </button>
                                )}
                                {dispatch.status === "in_progress" && (
                                  <button
                                    type="button"
                                    title="Complete dispatch"
                                    disabled={busy}
                                    onClick={() =>
                                      void handleStatusAction(
                                        dispatch,
                                        "complete",
                                      )
                                    }
                                    className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50 dark:hover:bg-emerald-400/10"
                                  >
                                    {busy ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2 size={16} />
                                    )}
                                  </button>
                                )}
                                {!["completed", "cancelled"].includes(
                                  dispatch.status,
                                ) && (
                                  <button
                                    type="button"
                                    title="Cancel dispatch"
                                    disabled={busy}
                                    onClick={() =>
                                      void handleStatusAction(
                                        dispatch,
                                        "cancel",
                                      )
                                    }
                                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-400/10"
                                  >
                                    <Ban size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    {filteredDispatches.length ? (page - 1) * PAGE_SIZE + 1 : 0}{" "}
                    to {Math.min(page * PAGE_SIZE, filteredDispatches.length)}{" "}
                    of {filteredDispatches.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                      className={secondaryButtonClass}
                    >
                      Previous
                    </button>
                    <span className="px-2 text-sm text-slate-500">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      className={secondaryButtonClass}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {modal === "create" && "Create Dispatch"}
                  {modal === "assign" && "Assign Vehicle & Driver"}
                  {modal === "details" && "Dispatch Details"}
                  {modal === "cancel" && "Cancel Dispatch"}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  FleetFlow Dispatch Management
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            {(modal === "create" || modal === "assign") && (
              <form
                onSubmit={modal === "create" ? handleCreate : handleAssign}
                className="space-y-5 p-5 sm:p-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Trip" required>
                    <select
                      required
                      disabled={modal === "assign" || lookupsLoading}
                      value={form.tripId}
                      onChange={(event) =>
                        updateForm("tripId", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">
                        {lookupsLoading
                          ? "Loading trips..."
                          : trips.length === 0
                            ? "No trips available"
                            : "Select a trip"}
                      </option>
                      {trips.map((trip) => (
                        <option key={trip.id} value={trip.id}>
                          {trip.label}
                          {trip.status ? ` (${trip.status})` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Scheduled Date & Time">
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(event) =>
                        updateForm("scheduledAt", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Vehicle" required={modal === "assign"}>
                    <select
                      required={modal === "assign"}
                      value={form.vehicleId}
                      onChange={(event) =>
                        updateForm("vehicleId", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">
                        {modal === "create"
                          ? "Leave unassigned"
                          : "Select vehicle"}
                      </option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                          {vehicle.status ? ` (${vehicle.status})` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Driver" required={modal === "assign"}>
                    <select
                      required={modal === "assign"}
                      value={form.driverId}
                      onChange={(event) =>
                        updateForm("driverId", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">
                        {modal === "create"
                          ? "Leave unassigned"
                          : "Select driver"}
                      </option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                          {driver.status ? ` (${driver.status})` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {modal === "create" && (
                    <div className="sm:col-span-2">
                      <Field label="Dispatch Notes">
                        <textarea
                          rows={3}
                          value={form.notes}
                          onChange={(event) =>
                            updateForm("notes", event.target.value)
                          }
                          placeholder="Enter instructions or additional notes..."
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  )}
                </div>
                {lookupsLoading && (
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={15} className="animate-spin" />
                    Loading trips, vehicles, and drivers...
                  </p>
                )}
                {/* Correct footer: form actions belong here, not Download PDF. */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className={secondaryButtonClass}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || lookupsLoading}
                    className={primaryButtonClass}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {modal === "create" ? (
                          <Plus size={16} />
                        ) : (
                          <UserRound size={16} />
                        )}
                        {modal === "create"
                          ? "Create Dispatch"
                          : "Assign Vehicle & Driver"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {modal === "details" && selectedDispatch && (
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Dispatch #{getDispatchId(selectedDispatch).slice(-8)}
                  </p>
                  <StatusBadge status={selectedDispatch.status} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ["Trip", tripName(selectedDispatch.tripId)],
                    ["Trip ID", selectedDispatch.tripId],
                    ["Vehicle", vehicleName(selectedDispatch.vehicleId)],
                    ["Vehicle ID", selectedDispatch.vehicleId || "Unassigned"],
                    ["Driver", driverName(selectedDispatch.driverId)],
                    ["Driver ID", selectedDispatch.driverId || "Unassigned"],
                    ["Assignment ID", selectedDispatch.assignmentId || "—"],
                    ["Scheduled", formatDate(selectedDispatch.scheduledAt)],
                    ["Dispatched", formatDate(selectedDispatch.dispatchedAt)],
                    ["Started", formatDate(selectedDispatch.startedAt)],
                    ["Completed", formatDate(selectedDispatch.completedAt)],
                    ["Created", formatDate(selectedDispatch.createdAt)],
                    ["Last Updated", formatDate(selectedDispatch.updatedAt)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                      <p className="mt-2 break-words text-sm font-medium text-slate-900 dark:text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                {selectedDispatch.notes && (
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Notes
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                      {selectedDispatch.notes}
                    </p>
                  </div>
                )}
                {selectedDispatch.cancellationReason && (
                  <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      Cancellation Reason
                    </p>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      {selectedDispatch.cancellationReason}
                    </p>
                  </div>
                )}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => downloadDispatchPdf(selectedDispatch)}
                    className={primaryButtonClass}
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={secondaryButtonClass}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {modal === "cancel" && selectedDispatch && (
              <form onSubmit={handleCancel} className="space-y-5 p-5 sm:p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Are you sure you want to cancel this dispatch?
                  </p>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Dispatch #{getDispatchId(selectedDispatch).slice(-8)}
                  </p>
                </div>
                <Field label="Cancellation Reason" required>
                  <textarea
                    required
                    minLength={3}
                    maxLength={500}
                    rows={4}
                    value={cancellationReason}
                    onChange={(event) =>
                      setCancellationReason(event.target.value)
                    }
                    placeholder="Explain why this dispatch is being cancelled..."
                    className={inputClass}
                  />
                </Field>
                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className={secondaryButtonClass}
                  >
                    Keep Dispatch
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Ban size={16} />
                    )}
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
