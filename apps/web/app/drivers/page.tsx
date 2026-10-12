"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  Filter,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";

type DriverStatus =
  | "available"
  | "on_trip"
  | "off_duty"
  | "suspended"
  | "inactive";

type LicenseType = "car" | "ltv" | "htv" | "motorcycle" | "bus" | "other";

interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

interface Driver {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiry: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: EmergencyContact;
  joiningDate?: string;
  status: DriverStatus;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DriverForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiry: string;
  dateOfBirth: string;
  address: string;
  joiningDate: string;
  status: DriverStatus;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
}

const configuredApiBase = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

const API_BASE = /\/api$/i.test(configuredApiBase)
  ? configuredApiBase
  : `${configuredApiBase}/api`;

const STATUSES: DriverStatus[] = [
  "available",
  "on_trip",
  "off_duty",
  "suspended",
  "inactive",
];

const LICENSE_TYPES: LicenseType[] = [
  "car",
  "ltv",
  "htv",
  "motorcycle",
  "bus",
  "other",
];

const emptyForm: DriverForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenseNumber: "",
  licenseType: "car",
  licenseExpiry: "",
  dateOfBirth: "",
  address: "",
  joiningDate: "",
  status: "available",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelationship: "",
};

const statusLabels: Record<DriverStatus, string> = {
  available: "Available",
  on_trip: "On Trip",
  off_duty: "Off Duty",
  suspended: "Suspended",
  inactive: "Inactive",
};

const statusStyles: Record<DriverStatus, string> = {
  available:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20",
  on_trip:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20",
  off_duty:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20",
  suspended:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
  inactive:
    "bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
};

function driverId(driver: Driver): string {
  return driver._id || driver.id || "";
}

function dateInputValue(value?: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayLicenseType(value: string): string {
  return value.toUpperCase();
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

function getDriverList(payload: unknown): Driver[] {
  if (!payload || typeof payload !== "object") return [];

  const result = payload as {
    data?: unknown;
    drivers?: unknown;
    results?: unknown;
  };

  if (Array.isArray(result.data)) return result.data as Driver[];
  if (Array.isArray(result.drivers)) return result.drivers as Driver[];
  if (Array.isArray(result.results)) return result.results as Driver[];

  if (result.data && typeof result.data === "object") {
    const nested = result.data as {
      drivers?: unknown;
      results?: unknown;
      items?: unknown;
    };

    if (Array.isArray(nested.drivers)) return nested.drivers as Driver[];
    if (Array.isArray(nested.results)) return nested.results as Driver[];
    if (Array.isArray(nested.items)) return nested.items as Driver[];
  }

  return [];
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
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
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

export default function DriversPage() {
  const { collapsed } = useSidebar();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DriverStatus>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>(emptyForm);

  const [menuDriverId, setMenuDriverId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = () =>
    typeof window !== "undefined"
      ? window.localStorage.getItem("fleetflow_token")
      : null;

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const currentToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("fleetflow_token")
        : null;

    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...init.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        getErrorMessage(payload, `Request failed (${response.status})`),
      );
    }

    return payload;
  }, []);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await request("/drivers");
      setDrivers(getDriverList(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load drivers.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void fetchDrivers();
  }, [fetchDrivers]);

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesStatus =
        statusFilter === "all" || driver.status === statusFilter;

      const searchable = [
        driver.firstName,
        driver.lastName,
        driver.email,
        driver.phone,
        driver.licenseNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [drivers, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: drivers.length,
      available: drivers.filter((d) => d.status === "available").length,
      onTrip: drivers.filter((d) => d.status === "on_trip").length,
      offDuty: drivers.filter((d) => d.status === "off_duty").length,
      suspended: drivers.filter((d) => d.status === "suspended").length,
    }),
    [drivers],
  );

  function openCreateModal() {
    setEditingDriver(null);
    setForm({ ...emptyForm });
    setError("");
    setNotice("");
    setModalOpen(true);
  }

  function openEditModal(driver: Driver) {
    setEditingDriver(driver);
    setForm({
      firstName: driver.firstName || "",
      lastName: driver.lastName || "",
      email: driver.email || "",
      phone: driver.phone || "",
      licenseNumber: driver.licenseNumber || "",
      licenseType: driver.licenseType || "car",
      licenseExpiry: dateInputValue(driver.licenseExpiry),
      dateOfBirth: dateInputValue(driver.dateOfBirth),
      address: driver.address || "",
      joiningDate: dateInputValue(driver.joiningDate),
      status: driver.status || "available",
      emergencyName: driver.emergencyContact?.name || "",
      emergencyPhone: driver.emergencyContact?.phone || "",
      emergencyRelationship: driver.emergencyContact?.relationship || "",
    });
    setError("");
    setNotice("");
    setViewingDriver(null);
    setModalOpen(true);
    setMenuDriverId(null);
  }

  function updateField<K extends keyof DriverForm>(
    key: K,
    value: DriverForm[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    const body: Record<string, unknown> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      licenseNumber: form.licenseNumber.trim(),
      licenseType: form.licenseType,
      licenseExpiry: form.licenseExpiry,
      status: form.status,
    };

    if (form.email.trim()) body.email = form.email.trim();
    if (form.dateOfBirth) body.dateOfBirth = form.dateOfBirth;
    if (form.address.trim()) body.address = form.address.trim();
    if (form.joiningDate) body.joiningDate = form.joiningDate;

    if (
      form.emergencyName.trim() ||
      form.emergencyPhone.trim() ||
      form.emergencyRelationship.trim()
    ) {
      body.emergencyContact = {
        ...(form.emergencyName.trim()
          ? { name: form.emergencyName.trim() }
          : {}),
        ...(form.emergencyPhone.trim()
          ? { phone: form.emergencyPhone.trim() }
          : {}),
        ...(form.emergencyRelationship.trim()
          ? { relationship: form.emergencyRelationship.trim() }
          : {}),
      };
    }

    try {
      if (editingDriver) {
        await request(
          `/drivers/${encodeURIComponent(driverId(editingDriver))}`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          },
        );
        setNotice("Driver updated successfully.");
      } else {
        await request("/drivers", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setNotice("Driver created successfully.");
      }

      setModalOpen(false);
      setEditingDriver(null);
      setForm({ ...emptyForm });
      await fetchDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save driver.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, status: DriverStatus) {
    setUpdatingStatusId(id);
    setError("");
    setNotice("");
    setMenuDriverId(null);

    try {
      await request(`/drivers/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setDrivers((previous) =>
        previous.map((driver) =>
          driverId(driver) === id ? { ...driver, status } : driver,
        ),
      );

      setNotice("Driver status updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update driver status.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(driver: Driver) {
    const id = driverId(driver);
    if (!id) {
      setError("This driver has no valid ID.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${driver.firstName} ${driver.lastName}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setNotice("");
    setMenuDriverId(null);

    try {
      await request(`/drivers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setDrivers((previous) =>
        previous.filter((item) => driverId(item) !== id),
      );
      setNotice("Driver deleted successfully.");

      if (viewingDriver && driverId(viewingDriver) === id) {
        setViewingDriver(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete driver.");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-slate-300";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-white">
      <DashboardSidebar />
      <DashboardHeader />

      <main
        className={`min-h-screen px-4 pb-10 pt-24 transition-all duration-300 sm:px-6 lg:px-8 ${
          collapsed ? "lg:pl-[104px]" : "lg:pl-[294px]"
        }`}
      >
        <div className="mx-auto max-w-[1600px]">
          {/* Page heading */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                <Truck size={16} />
                <span>Fleet Management</span>
                <span>/</span>
                <span className="text-blue-600 dark:text-blue-400">
                  Drivers
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Driver Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-slate-400">
                Manage your drivers, license details, availability, and
                emergency contacts in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void fetchDrivers()}
                disabled={Boolean(loading)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              >
                <Plus size={17} />
                Add Driver
              </button>
            </div>
          </div>

          {/* Notifications */}
          {error && !modalOpen && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{error}</div>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}

          {notice && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 size={18} className="shrink-0" />
              <span className="flex-1">{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss notice">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Drivers"
              value={stats.total}
              description="All registered drivers"
              icon={Users}
              iconClass="bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
            />
            <StatCard
              title="Available"
              value={stats.available}
              description="Ready for assignment"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
            />
            <StatCard
              title="On Trip"
              value={stats.onTrip}
              description="Currently on the road"
              icon={Truck}
              iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400"
            />
            <StatCard
              title="Off Duty"
              value={stats.offDuty}
              description={`${stats.suspended} suspended`}
              icon={Clock3}
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
            />
          </div>

          {/* Main list */}
          <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-slate-800 sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold">All Drivers</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    {filteredDrivers.length}{" "}
                    {filteredDrivers.length === 1 ? "driver" : "drivers"} shown
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                  <Activity size={15} />
                  Live data from Driver Service
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, phone, email, or license..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950"
                  />
                </div>

                <div className="relative md:w-56">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as "all" | DriverStatus,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="all">All statuses</option>
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="animate-spin text-blue-600" size={30} />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Loading drivers...
                </p>
              </div>
            ) : error && drivers.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <div className="rounded-2xl bg-red-50 p-4 text-red-600 dark:bg-red-400/10 dark:text-red-400">
                  <AlertCircle size={28} />
                </div>
                <h3 className="mt-4 font-semibold">Could not load drivers</h3>
                <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-slate-400">
                  {error}
                </p>
                <button
                  onClick={() => void fetchDrivers()}
                  className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <div className="rounded-2xl bg-blue-50 p-4 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                  <UserRound size={28} />
                </div>
                <h3 className="mt-4 font-semibold">
                  {drivers.length === 0 ? "No drivers yet" : "No drivers found"}
                </h3>
                <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-slate-400">
                  {drivers.length === 0
                    ? "Add your first driver to start managing licenses, availability, and contact information."
                    : "Try changing your search or status filter."}
                </p>
                {drivers.length === 0 ? (
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add your first driver
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                    className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-slate-950/60 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Driver</th>
                        <th className="px-6 py-4 font-semibold">Contact</th>
                        <th className="px-6 py-4 font-semibold">License</th>
                        <th className="px-6 py-4 font-semibold">Expiry Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {filteredDrivers.map((driver) => {
                        const id = driverId(driver);

                        return (
                          <tr
                            key={id || `${driver.firstName}-${driver.lastName}`}
                            className="transition hover:bg-gray-50/80 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                                  {driver.firstName?.[0]?.toUpperCase()}
                                  {driver.lastName?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {driver.firstName} {driver.lastName}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                    Joined {formatDate(driver.joiningDate)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="space-y-1.5 text-sm">
                                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300">
                                  <Phone size={13} className="text-gray-400" />
                                  {driver.phone || "—"}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                                  <Mail size={13} />
                                  <span className="max-w-44 truncate">
                                    {driver.email || "No email"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                                {driver.licenseNumber}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                {displayLicenseType(driver.licenseType)}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                              <span className="inline-flex items-center gap-2">
                                <CalendarDays
                                  size={14}
                                  className="text-gray-400"
                                />
                                {formatDate(driver.licenseExpiry)}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="relative inline-flex">
                                <select
                                  aria-label={`Status for ${driver.firstName} ${driver.lastName}`}
                                  value={driver.status}
                                  disabled={updatingStatusId === id || !id}
                                  onChange={(event) =>
                                    void handleStatusChange(
                                      id,
                                      event.target.value as DriverStatus,
                                    )
                                  }
                                  className={`max-w-36 cursor-pointer appearance-none rounded-full px-3 py-1.5 pr-7 text-xs font-semibold ring-1 ring-inset outline-none disabled:opacity-50 ${statusStyles[driver.status]}`}
                                >
                                  {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {statusLabels[status]}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={12}
                                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                                />
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  title="View driver"
                                  onClick={() => setViewingDriver(driver)}
                                  className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                                >
                                  <Eye size={17} />
                                </button>
                                <button
                                  title="Edit driver"
                                  onClick={() => openEditModal(driver)}
                                  className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                                >
                                  <Edit3 size={17} />
                                </button>
                                <button
                                  title="Delete driver"
                                  disabled={deletingId === id}
                                  onClick={() => void handleDelete(driver)}
                                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-400/10 dark:hover:text-red-400"
                                >
                                  {deletingId === id ? (
                                    <Loader2
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={17} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile and tablet cards */}
                <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">
                  {filteredDrivers.map((driver) => {
                    const id = driverId(driver);

                    return (
                      <article
                        key={id || `${driver.firstName}-${driver.lastName}`}
                        className="rounded-xl border border-gray-200 p-4 dark:border-slate-800"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                            {driver.firstName?.[0]?.toUpperCase()}
                            {driver.lastName?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold">
                              {driver.firstName} {driver.lastName}
                            </h3>
                            <p className="mt-1 truncate text-xs text-gray-500 dark:text-slate-400">
                              {driver.licenseNumber}
                            </p>
                            <span
                              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[driver.status]}`}
                            >
                              {statusLabels[driver.status]}
                            </span>
                          </div>
                          <button
                            aria-label="View driver details"
                            onClick={() => setViewingDriver(driver)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                          >
                            <Eye size={17} />
                          </button>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-sm dark:border-slate-800">
                          <p className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                            <Phone
                              size={14}
                              className="shrink-0 text-gray-400"
                            />
                            {driver.phone}
                          </p>
                          <p className="flex items-center gap-2 break-all text-gray-600 dark:text-slate-300">
                            <Mail
                              size={14}
                              className="shrink-0 text-gray-400"
                            />
                            {driver.email || "No email"}
                          </p>
                          <p className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                            <ShieldCheck
                              size={14}
                              className="shrink-0 text-gray-400"
                            />
                            {displayLicenseType(driver.licenseType)} · Expires{" "}
                            {formatDate(driver.licenseExpiry)}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <select
                            aria-label="Change driver status"
                            value={driver.status}
                            disabled={updatingStatusId === id || !id}
                            onChange={(event) =>
                              void handleStatusChange(
                                id,
                                event.target.value as DriverStatus,
                              )
                            }
                            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => openEditModal(driver)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDelete(driver)}
                            disabled={deletingId === id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {!loading && filteredDrivers.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4 text-xs text-gray-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredDrivers.length} of {drivers.length} drivers
                </span>
                <span>
                  Driver data is scoped by your authenticated account.
                </span>
              </div>
            )}
          </section>

          {/* Additional summary */}
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Driver compliance</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Keep license details and driver contact information up to
                  date.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.suspended}
              </span>
              suspended driver{stats.suspended === 1 ? "" : "s"}
              <ArrowUpRight size={15} />
            </div>
          </div>
        </div>
      </main>

      {/* Create / edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="driver-form-title"
            className="my-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:my-0"
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-5 dark:border-slate-800 sm:px-7">
              <div>
                <h2 id="driver-form-title" className="text-xl font-bold">
                  {editingDriver ? "Edit Driver" : "Add New Driver"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {editingDriver
                    ? "Update the driver's information."
                    : "Enter the driver's personal and license details."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="max-h-[65vh] space-y-7 overflow-y-auto px-5 py-6 sm:px-7">
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <h3 className="mb-4 text-sm font-bold">
                    Personal information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      First name *
                      <input
                        required
                        minLength={2}
                        maxLength={50}
                        value={form.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        className={inputClass}
                        placeholder="e.g. Muhammad"
                      />
                    </label>

                    <label className={labelClass}>
                      Last name *
                      <input
                        required
                        minLength={2}
                        maxLength={50}
                        value={form.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        className={inputClass}
                        placeholder="e.g. Ahmed"
                      />
                    </label>

                    <label className={labelClass}>
                      Phone number *
                      <input
                        required
                        minLength={5}
                        maxLength={30}
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className={inputClass}
                        placeholder="+92 300 1234567"
                      />
                    </label>

                    <label className={labelClass}>
                      Email address
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className={inputClass}
                        placeholder="driver@example.com"
                      />
                    </label>

                    <label className={labelClass}>
                      Date of birth
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) =>
                          updateField("dateOfBirth", e.target.value)
                        }
                        className={inputClass}
                      />
                    </label>

                    <label className={labelClass}>
                      Joining date
                      <input
                        type="date"
                        value={form.joiningDate}
                        onChange={(e) =>
                          updateField("joiningDate", e.target.value)
                        }
                        className={inputClass}
                      />
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Home address
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        className={inputClass}
                        placeholder="Enter full address"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 dark:border-slate-800">
                  <h3 className="mb-4 text-sm font-bold">
                    License information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      License number *
                      <input
                        required
                        minLength={2}
                        maxLength={50}
                        value={form.licenseNumber}
                        onChange={(e) =>
                          updateField("licenseNumber", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Enter license number"
                      />
                    </label>

                    <label className={labelClass}>
                      License type *
                      <select
                        required
                        value={form.licenseType}
                        onChange={(e) =>
                          updateField(
                            "licenseType",
                            e.target.value as LicenseType,
                          )
                        }
                        className={inputClass}
                      >
                        {LICENSE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={labelClass}>
                      License expiry date *
                      <input
                        required
                        type="date"
                        value={form.licenseExpiry}
                        onChange={(e) =>
                          updateField("licenseExpiry", e.target.value)
                        }
                        className={inputClass}
                      />
                    </label>

                    <label className={labelClass}>
                      Driver status
                      <select
                        value={form.status}
                        onChange={(e) =>
                          updateField("status", e.target.value as DriverStatus)
                        }
                        className={inputClass}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 dark:border-slate-800">
                  <h3 className="mb-1 text-sm font-bold">Emergency contact</h3>
                  <p className="mb-4 text-xs text-gray-500 dark:text-slate-400">
                    Optional details to contact in an emergency.
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Contact name
                      <input
                        value={form.emergencyName}
                        onChange={(e) =>
                          updateField("emergencyName", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Full name"
                      />
                    </label>

                    <label className={labelClass}>
                      Contact phone
                      <input
                        type="tel"
                        value={form.emergencyPhone}
                        onChange={(e) =>
                          updateField("emergencyPhone", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Phone number"
                      />
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Relationship
                      <input
                        value={form.emergencyRelationship}
                        onChange={(e) =>
                          updateField("emergencyRelationship", e.target.value)
                        }
                        className={inputClass}
                        placeholder="e.g. Spouse, Parent"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {editingDriver ? "Save Changes" : "Create Driver"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Driver details modal */}
      {viewingDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="driver-detail-title"
            className="my-4 w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-slate-800 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                  {viewingDriver.firstName?.[0]?.toUpperCase()}
                  {viewingDriver.lastName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 id="driver-detail-title" className="text-xl font-bold">
                    {viewingDriver.firstName} {viewingDriver.lastName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Driver profile
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[viewingDriver.status]}`}
                  >
                    {statusLabels[viewingDriver.status]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingDriver(null)}
                aria-label="Close driver details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Phone
                </p>
                <p className="mt-1 break-words text-sm font-medium">
                  {viewingDriver.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Email
                </p>
                <p className="mt-1 break-all text-sm font-medium">
                  {viewingDriver.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  License number
                </p>
                <p className="mt-1 text-sm font-medium">
                  {viewingDriver.licenseNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  License type
                </p>
                <p className="mt-1 text-sm font-medium">
                  {viewingDriver.licenseType
                    ? displayLicenseType(viewingDriver.licenseType)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  License expiry
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(viewingDriver.licenseExpiry)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Date of birth
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(viewingDriver.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Joining date
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(viewingDriver.joiningDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Emergency contact
                </p>
                <p className="mt-1 text-sm font-medium">
                  {viewingDriver.emergencyContact?.name || "—"}
                </p>
                {viewingDriver.emergencyContact?.phone && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {viewingDriver.emergencyContact.phone}
                  </p>
                )}
                {viewingDriver.emergencyContact?.relationship && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {viewingDriver.emergencyContact.relationship}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Address
                </p>
                <p className="mt-1 flex items-start gap-2 text-sm font-medium">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                  {viewingDriver.address || "No address provided"}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:justify-end sm:p-6">
              <button
                onClick={() => setViewingDriver(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => openEditModal(viewingDriver)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Edit3 size={16} />
                Edit Driver
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
