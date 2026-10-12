"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  ImagePlus,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  Upload,
  User,
  UserCheck,
  Users,
  X,
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

const DRIVER_SERVICE_BASE = (
  process.env.NEXT_PUBLIC_DRIVER_SERVICE_URL || "http://localhost:4009"
).replace(/\/+$/, "");

const TOKEN_KEY = "fleetflow_token";
const PAGE_SIZE = 10;

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type DriverStatus =
  | "available"
  | "assigned"
  | "on_trip"
  | "on_leave"
  | "inactive";

type LicenseType =
  | "motorcycle"
  | "car"
  | "light_transport"
  | "heavy_transport"
  | "commercial"
  | "other";

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
  status: DriverStatus;
  profileImage?: string | null;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface DriverFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType: LicenseType;
  licenseExpiry: string;
  status: DriverStatus;
}

type ModalType = "create" | "edit" | "details" | "avatar" | null;

const EMPTY_FORM: DriverFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenseNumber: "",
  licenseType: "car",
  licenseExpiry: "",
  status: "available",
};

const STATUS_OPTIONS: { value: DriverStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "on_trip", label: "On Trip" },
  { value: "on_leave", label: "On Leave" },
  { value: "inactive", label: "Inactive" },
];

const LICENSE_OPTIONS: { value: LicenseType; label: string }[] = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "light_transport", label: "Light Transport" },
  { value: "heavy_transport", label: "Heavy Transport" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function getDriverId(driver: Driver): string {
  return String(driver._id || driver.id || "");
}

function getDriverName(driver: Driver): string {
  return `${driver.firstName || ""} ${driver.lastName || ""}`.trim();
}

function getInitials(driver: Driver): string {
  const first = driver.firstName?.trim()?.[0] ?? "";
  const last = driver.lastName?.trim()?.[0] ?? "";

  return `${first}${last}`.toUpperCase() || "DR";
}

/**
 * Resolve both absolute URLs and relative upload paths.
 *
 * Examples:
 *   http://localhost:4009/uploads/drivers/photo.jpg
 *   /uploads/drivers/photo.jpg
 *   uploads/drivers/photo.jpg
 */
function resolveDriverImageUrl(value?: string | null): string {
  if (!value?.trim()) return "";

  const imagePath = value.trim();

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  if (imagePath.startsWith("blob:")) {
    return imagePath;
  }

  if (imagePath.startsWith("//")) {
    return `http:${imagePath}`;
  }

  try {
    return new URL(
      imagePath.replace(/^\/+/, ""),
      `${DRIVER_SERVICE_BASE}/`,
    ).toString();
  } catch {
    return "";
  }
}

function normalizeDriver(value: unknown): Driver {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const imageValue =
    raw.profileImage ??
    raw.profileImageUrl ??
    raw.avatarUrl ??
    raw.avatar ??
    raw.photoUrl ??
    raw.imageUrl;

  const validStatuses: DriverStatus[] = [
    "available",
    "assigned",
    "on_trip",
    "on_leave",
    "inactive",
  ];

  const validLicenseTypes: LicenseType[] = [
    "motorcycle",
    "car",
    "light_transport",
    "heavy_transport",
    "commercial",
    "other",
  ];

  const status =
    typeof raw.status === "string" &&
    validStatuses.includes(raw.status as DriverStatus)
      ? (raw.status as DriverStatus)
      : "available";

  const licenseType =
    typeof raw.licenseType === "string" &&
    validLicenseTypes.includes(raw.licenseType as LicenseType)
      ? (raw.licenseType as LicenseType)
      : "other";

  return {
    ...raw,
    _id: typeof raw._id === "string" ? raw._id : undefined,
    id: typeof raw.id === "string" ? raw.id : undefined,
    firstName: typeof raw.firstName === "string" ? raw.firstName : "",
    lastName: typeof raw.lastName === "string" ? raw.lastName : "",
    email: typeof raw.email === "string" ? raw.email : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    licenseNumber:
      typeof raw.licenseNumber === "string" ? raw.licenseNumber : "",
    licenseType,
    licenseExpiry:
      typeof raw.licenseExpiry === "string" ? raw.licenseExpiry : "",
    status,
    profileImage:
      typeof imageValue === "string" ? resolveDriverImageUrl(imageValue) : null,
  } as Driver;
}

function getDriverList(payload: unknown): Driver[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeDriver);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const raw = payload as Record<string, unknown>;

  const candidates: unknown[] = [
    raw.data,
    raw.drivers,
    raw.results,
    raw.items,
    raw.users,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeDriver);
    }

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;

      for (const key of ["drivers", "results", "items", "users"]) {
        if (Array.isArray(nested[key])) {
          return (nested[key] as unknown[]).map(normalizeDriver);
        }
      }
    }
  }

  if (typeof raw.firstName === "string" || typeof raw._id === "string") {
    return [normalizeDriver(raw)];
  }

  return [];
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isLicenseExpired(value?: string | null): boolean {
  if (!value) return false;

  const expiry = new Date(value);

  if (Number.isNaN(expiry.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return expiry < today;
}

function getStatusClasses(status: DriverStatus): string {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20";
    case "assigned":
      return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20";
    case "on_trip":
      return "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/20";
    case "on_leave":
      return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20";
    case "inactive":
      return "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

function getStatusLabel(status: DriverStatus): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status.replace(/_/g, " ")
  );
}

/* -------------------------------------------------------------------------- */
/*                             Avatar component                               */
/* -------------------------------------------------------------------------- */

function DriverAvatar({
  driver,
  size = "normal",
  onClick,
}: {
  driver: Driver;
  size?: "normal" | "large";
  onClick?: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = driver.profileImage?.trim() || "";

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const sizeClass =
    size === "large" ? "h-16 w-16 rounded-2xl" : "h-11 w-11 rounded-xl";

  const textClass = size === "large" ? "text-lg" : "text-sm";

  const avatarContent =
    imageUrl && !imageFailed ? (
      <img
        src={imageUrl}
        alt={`${getDriverName(driver)} profile`}
        className={`${sizeClass} shrink-0 border border-slate-200 object-cover dark:border-slate-700`}
        onError={() => {
          console.error("Unable to load driver profile image:", imageUrl);
          setImageFailed(true);
        }}
      />
    ) : (
      <div
        aria-label={`${getDriverName(driver)} initials`}
        className={`flex ${sizeClass} shrink-0 items-center justify-center border border-blue-100 bg-blue-50 font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400 ${textClass}`}
      >
        {getInitials(driver)}
      </div>
    );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Change profile photo"
        className="shrink-0 rounded-2xl transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        {avatarContent}
      </button>
    );
  }

  return avatarContent;
}

/* -------------------------------------------------------------------------- */
/*                              Reusable UI                                   */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: DriverStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusClasses(status)}`}
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
  icon: typeof Users;
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

/* -------------------------------------------------------------------------- */
/*                              Main page                                     */
/* -------------------------------------------------------------------------- */

export default function DriversPage() {
  const { collapsed } = useSidebar();

  const [mounted, setMounted] = useState(false);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">("all");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverFormData>(EMPTY_FORM);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);

  // Keep the server render and first client render identical.
  useEffect(() => {
    setMounted(true);
  }, []);

  const request = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem(TOKEN_KEY)
          : null;

      const headers = new Headers(options.headers);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
      ) {
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
          const nested =
            raw.error && typeof raw.error === "object"
              ? (raw.error as Record<string, unknown>)
              : null;

          if (typeof raw.message === "string") {
            message = raw.message;
          } else if (typeof raw.error === "string") {
            message = raw.error;
          } else if (nested && typeof nested.message === "string") {
            message = nested.message;
          }
        }

        throw new Error(message);
      }

      return payload;
    },
    [],
  );

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
    const normalizedSearch = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesStatus =
        statusFilter === "all" || driver.status === statusFilter;

      const searchableValues = [
        getDriverName(driver),
        driver.email,
        driver.phone,
        driver.licenseNumber,
        driver.licenseType,
      ];

      const matchesSearch =
        !normalizedSearch ||
        searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );

      return matchesStatus && matchesSearch;
    });
  }, [drivers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / PAGE_SIZE));

  const paginatedDrivers = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredDrivers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredDrivers, page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(
    () => ({
      total: drivers.length,
      available: drivers.filter((driver) => driver.status === "available")
        .length,
      assigned: drivers.filter((driver) => driver.status === "assigned").length,
      inactive: drivers.filter((driver) => driver.status === "inactive").length,
    }),
    [drivers],
  );

  function clearNotifications() {
    setError("");
    setSuccess("");
  }

  function openCreateModal() {
    clearNotifications();
    setForm(EMPTY_FORM);
    setSelectedDriver(null);
    setModal("create");
  }

  function openEditModal(driver: Driver) {
    clearNotifications();
    setSelectedDriver(driver);

    setForm({
      firstName: driver.firstName ?? "",
      lastName: driver.lastName ?? "",
      email: driver.email ?? "",
      phone: driver.phone ?? "",
      licenseNumber: driver.licenseNumber ?? "",
      licenseType: driver.licenseType ?? "other",
      licenseExpiry: driver.licenseExpiry
        ? driver.licenseExpiry.slice(0, 10)
        : "",
      status: driver.status ?? "available",
    });

    setModal("edit");
  }

  function openDetailsModal(driver: Driver) {
    clearNotifications();
    setSelectedDriver(driver);
    setModal("details");
  }

  function closeModal() {
    if (submitting || uploading) return;

    setModal(null);
    setSelectedDriver(null);
    setForm(EMPTY_FORM);
    setUploadFile(null);
    setUploadPreview("");
  }

  function updateForm<K extends keyof DriverFormData>(
    key: K,
    value: DriverFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearNotifications();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (!form.phone.trim() || !form.licenseNumber.trim()) {
      setError("Phone number and license number are required.");
      return;
    }

    setSubmitting(true);

    try {
      const body = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim(),
        licenseType: form.licenseType,
        licenseExpiry: form.licenseExpiry,
        status: form.status,
      };

      if (modal === "edit" && selectedDriver) {
        const id = getDriverId(selectedDriver);

        if (!id) {
          throw new Error("The selected driver does not have a valid ID.");
        }

        await request(`/drivers/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });

        setSuccess("Driver updated successfully.");
      } else {
        await request("/drivers", {
          method: "POST",
          body: JSON.stringify(body),
        });

        setSuccess("Driver created successfully.");
      }

      setModal(null);
      setSelectedDriver(null);
      setForm(EMPTY_FORM);
      await fetchDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save driver.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    const id = getDriverId(deleteTarget);

    if (!id) {
      setError("The selected driver does not have a valid ID.");
      setDeleteTarget(null);
      return;
    }

    clearNotifications();
    setSubmitting(true);

    try {
      await request(`/drivers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      setDrivers((current) =>
        current.filter((driver) => getDriverId(driver) !== id),
      );

      setSuccess("Driver deleted successfully.");
      setDeleteTarget(null);

      if (selectedDriver && getDriverId(selectedDriver) === id) {
        setSelectedDriver(null);
        setModal(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete driver.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(driver: Driver, nextStatus: DriverStatus) {
    const id = getDriverId(driver);

    if (!id) {
      setError("The selected driver does not have a valid ID.");
      return;
    }

    clearNotifications();

    try {
      const payload = await request(`/drivers/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      const updatedFromResponse = getDriverList(payload)[0];

      setDrivers((current) =>
        current.map((item) =>
          getDriverId(item) === id
            ? updatedFromResponse
              ? { ...item, ...updatedFromResponse, status: nextStatus }
              : { ...item, status: nextStatus }
            : item,
        ),
      );

      setSuccess("Driver status updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update driver status.",
      );
    }
  }

  function openAvatarModal(driver: Driver) {
    clearNotifications();
    setSelectedDriver(driver);
    setUploadFile(null);
    setUploadPreview("");
    setModal("avatar");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setUploadFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadPreview(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleAvatarUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDriver || !uploadFile) {
      setError("Please select an image before uploading.");
      return;
    }

    const id = getDriverId(selectedDriver);

    if (!id) {
      setError("The selected driver does not have a valid ID.");
      return;
    }

    clearNotifications();
    setUploading(true);

    try {
      const token = window.localStorage.getItem(TOKEN_KEY);
      const formData = new FormData();

      formData.append("file", uploadFile);

      const headers = new Headers();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(
        `${API_BASE}/drivers/${encodeURIComponent(id)}/profile-image`,
        {
          method: "POST",
          headers,
          body: formData,
        },
      );

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
        const raw =
          payload && typeof payload === "object"
            ? (payload as Record<string, unknown>)
            : {};

        throw new Error(
          typeof raw.message === "string"
            ? raw.message
            : typeof raw.error === "string"
              ? raw.error
              : `Image upload failed (${response.status}).`,
        );
      }

      setModal(null);
      setUploadFile(null);
      setUploadPreview("");
      setSuccess("Driver profile photo uploaded successfully.");

      await fetchDrivers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to upload profile photo.",
      );
    } finally {
      setUploading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                   Render                                 */
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
                  Drivers
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Driver Management
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manage driver profiles, licenses, availability, and contact
                details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchDrivers()}
                // mounted=false during SSR and the first client render,
                // preventing the disabled=true / disabled-absent mismatch.
                disabled={mounted && loading}
                className={secondaryButtonClass}
              >
                <RefreshCw
                  size={16}
                  className={mounted && loading ? "animate-spin" : ""}
                />
                {mounted && loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className={primaryButtonClass}
              >
                <Plus size={17} />
                Add Driver
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
                className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                aria-label="Dismiss error"
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
                className="rounded-lg p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                aria-label="Dismiss success message"
              >
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
              description="Ready for assignments"
              icon={UserCheck}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
            />

            <StatCard
              title="Assigned"
              value={stats.assigned}
              description="Currently assigned"
              icon={Truck}
              iconClass="bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400"
            />

            <StatCard
              title="Inactive"
              value={stats.inactive}
              description="Not currently available"
              icon={ShieldCheck}
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
            />
          </div>

          {/* Driver table and filters */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Drivers
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {filteredDrivers.length}{" "}
                    {filteredDrivers.length === 1 ? "driver" : "drivers"} found
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
                      placeholder="Search drivers..."
                      className={`${inputClass} pl-9`}
                      aria-label="Search drivers"
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
                          event.target.value as DriverStatus | "all",
                        )
                      }
                      className={`${inputClass} appearance-none pl-9 pr-9`}
                      aria-label="Filter by status"
                    >
                      <option value="all">All statuses</option>
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
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Driver</th>
                    <th className="px-5 py-4 font-semibold">Contact</th>
                    <th className="px-5 py-4 font-semibold">License</th>
                    <th className="px-5 py-4 font-semibold">Expiry</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading && drivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Loader2
                          size={25}
                          className="mx-auto animate-spin text-blue-600"
                        />
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                          Loading drivers...
                        </p>
                      </td>
                    </tr>
                  ) : paginatedDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <Users size={22} />
                        </div>
                        <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                          No drivers found
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Try changing your filters or add a new driver.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedDrivers.map((driver) => {
                      const id = getDriverId(driver);
                      const expired = isLicenseExpired(driver.licenseExpiry);

                      return (
                        <tr
                          key={id || `${driver.firstName}-${driver.lastName}`}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <DriverAvatar
                                driver={driver}
                                onClick={() => openAvatarModal(driver)}
                              />

                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => openDetailsModal(driver)}
                                  className="block max-w-[220px] truncate text-sm font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                >
                                  {getDriverName(driver) || "Unnamed Driver"}
                                </button>
                                <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500 dark:text-slate-400">
                                  {driver.email || "No email provided"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Phone size={14} className="text-slate-400" />
                              {driver.phone || "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {driver.licenseNumber || "—"}
                            </p>
                            <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                              {driver.licenseType.replace(/_/g, " ")}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className={`flex items-center gap-2 text-sm ${
                                expired
                                  ? "font-medium text-red-600 dark:text-red-400"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <CalendarDays
                                size={14}
                                className="shrink-0 text-slate-400"
                              />
                              {formatDate(driver.licenseExpiry)}
                            </div>
                            {expired && (
                              <p className="mt-1 text-xs text-red-500">
                                License expired
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={driver.status} />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openDetailsModal(driver)}
                                title="View driver"
                                aria-label={`View ${getDriverName(driver)}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(driver)}
                                title="Edit driver"
                                aria-label={`Edit ${getDriverName(driver)}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-400/10 dark:hover:text-blue-400"
                              >
                                <Edit size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget(driver)}
                                title="Delete driver"
                                aria-label={`Delete ${getDriverName(driver)}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10 dark:hover:text-red-400"
                              >
                                <Trash2 size={17} />
                              </button>
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
              {loading && drivers.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Loader2
                    size={25}
                    className="mx-auto animate-spin text-blue-600"
                  />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Loading drivers...
                  </p>
                </div>
              ) : paginatedDrivers.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <Users size={26} className="mx-auto text-slate-400" />
                  <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">
                    No drivers found
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Try changing your search or status filter.
                  </p>
                </div>
              ) : (
                paginatedDrivers.map((driver) => (
                  <article
                    key={getDriverId(driver) || getDriverName(driver)}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <DriverAvatar
                        driver={driver}
                        onClick={() => openAvatarModal(driver)}
                      />

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => openDetailsModal(driver)}
                          className="block max-w-full truncate text-left font-semibold text-slate-900 dark:text-white"
                        >
                          {getDriverName(driver) || "Unnamed Driver"}
                        </button>

                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                          {driver.email || "No email provided"}
                        </p>

                        <div className="mt-2">
                          <StatusBadge status={driver.status} />
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(driver)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label="Edit driver"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(driver)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-400/10"
                          aria-label="Delete driver"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Phone
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {driver.phone || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          License
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {driver.licenseNumber || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          License type
                        </p>
                        <p className="mt-1 truncate text-sm font-medium capitalize text-slate-800 dark:text-slate-200">
                          {driver.licenseType.replace(/_/g, " ")}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          License expiry
                        </p>
                        <p
                          className={`mt-1 text-sm font-medium ${
                            isLicenseExpired(driver.licenseExpiry)
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {formatDate(driver.licenseExpiry)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => openDetailsModal(driver)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Eye size={15} />
                        View details
                      </button>

                      <select
                        aria-label={`Change status for ${getDriverName(driver)}`}
                        value={driver.status}
                        onChange={(event) =>
                          void handleStatusChange(
                            driver,
                            event.target.value as DriverStatus,
                          )
                        }
                        className="max-w-36 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
                  {filteredDrivers.length === 0
                    ? 0
                    : (page - 1) * PAGE_SIZE + 1}
                  {"–"}
                  {Math.min(page * PAGE_SIZE, filteredDrivers.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {filteredDrivers.length}
                </span>{" "}
                drivers
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

      {/* -------------------------------------------------------------------- */}
      {/*                         Create / Edit modal                          */}
      {/* -------------------------------------------------------------------- */}

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
            aria-labelledby="driver-form-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div>
                <h2
                  id="driver-form-title"
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  {modal === "edit" ? "Edit Driver" : "Add New Driver"}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {modal === "edit"
                    ? "Update the driver's information."
                    : "Enter the information to register a driver."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close form"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid max-h-[65vh] grid-cols-1 gap-5 overflow-y-auto p-5 sm:grid-cols-2 sm:p-6">
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Personal information
                  </p>
                </div>

                <Field label="First name" required>
                  <input
                    className={inputClass}
                    value={form.firstName}
                    onChange={(event) =>
                      updateForm("firstName", event.target.value)
                    }
                    placeholder="Enter first name"
                    required
                    autoComplete="given-name"
                  />
                </Field>

                <Field label="Last name" required>
                  <input
                    className={inputClass}
                    value={form.lastName}
                    onChange={(event) =>
                      updateForm("lastName", event.target.value)
                    }
                    placeholder="Enter last name"
                    required
                    autoComplete="family-name"
                  />
                </Field>

                <Field label="Email address">
                  <input
                    className={inputClass}
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm("email", event.target.value)
                    }
                    placeholder="driver@example.com"
                    autoComplete="email"
                  />
                </Field>

                <Field label="Phone number" required>
                  <input
                    className={inputClass}
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm("phone", event.target.value)
                    }
                    placeholder="Enter phone number"
                    required
                    autoComplete="tel"
                  />
                </Field>

                <div className="sm:col-span-2 mt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    License information
                  </p>
                </div>

                <Field label="License number" required>
                  <input
                    className={inputClass}
                    value={form.licenseNumber}
                    onChange={(event) =>
                      updateForm("licenseNumber", event.target.value)
                    }
                    placeholder="Enter license number"
                    required
                  />
                </Field>

                <Field label="License type" required>
                  <select
                    className={inputClass}
                    value={form.licenseType}
                    onChange={(event) =>
                      updateForm(
                        "licenseType",
                        event.target.value as LicenseType,
                      )
                    }
                    required
                  >
                    {LICENSE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="License expiry">
                  <input
                    className={inputClass}
                    type="date"
                    value={form.licenseExpiry}
                    onChange={(event) =>
                      updateForm("licenseExpiry", event.target.value)
                    }
                  />
                </Field>

                <Field label="Driver status" required>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value as DriverStatus)
                    }
                    required
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
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
                  disabled={submitting}
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
                      : "Create Driver"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/*                          Driver details modal                        */}
      {/* -------------------------------------------------------------------- */}

      {modal === "details" && selectedDriver && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="driver-details-title"
            className="my-auto flex max-h-[95dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Header */}
            <div className="relative h-28 shrink-0 bg-gradient-to-r from-blue-700 to-indigo-600">
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close driver details"
                className="absolute right-4 top-4 rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25"
              >
                <X size={19} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-5 pb-6 sm:px-7">
                {/* Profile and actions */}
                <div className="relative z-10 -mt-8 flex min-h-[100px] flex-wrap items-end justify-between gap-3 pt-2">
                  <DriverAvatar
                    driver={selectedDriver}
                    size="large"
                    onClick={() => openAvatarModal(selectedDriver)}
                  />

                  <div className="flex flex-wrap gap-2 pb-1">
                    <button
                      type="button"
                      onClick={() => openAvatarModal(selectedDriver)}
                      className={secondaryButtonClass}
                    >
                      <ImagePlus size={16} />
                      Photo
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(selectedDriver)}
                      className={primaryButtonClass}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Driver identity */}
                <h2
                  id="driver-details-title"
                  className="mt-4 break-words text-2xl font-bold text-slate-900 dark:text-white"
                >
                  {getDriverName(selectedDriver) || "Unnamed Driver"}
                </h2>

                <div className="mt-2">
                  <StatusBadge status={selectedDriver.status} />
                </div>

                {/* Driver information */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Mail size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Email address
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-800 dark:text-slate-200">
                        {selectedDriver.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Phone size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Phone number
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                        {selectedDriver.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        License number
                      </p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                        {selectedDriver.licenseNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        License type
                      </p>
                      <p className="mt-1 text-sm font-medium capitalize text-slate-800 dark:text-slate-200">
                        {selectedDriver.licenseType?.replace(/_/g, " ") ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <CalendarDays size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        License expiry
                      </p>
                      <p
                        className={`mt-1 text-sm font-medium ${
                          isLicenseExpired(selectedDriver.licenseExpiry)
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {selectedDriver.licenseExpiry
                          ? formatDate(selectedDriver.licenseExpiry)
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {selectedDriver.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Clock size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Registered on
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {formatDate(selectedDriver.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status management */}
                <div className="mt-7 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <Field label="Update driver status">
                    <select
                      className={inputClass}
                      value={selectedDriver.status}
                      onChange={(event) => {
                        const nextStatus = event.target.value as DriverStatus;

                        setSelectedDriver((current) =>
                          current
                            ? { ...current, status: nextStatus }
                            : current,
                        );

                        void handleStatusChange(selectedDriver, nextStatus);
                      }}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-7">
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

      {/* -------------------------------------------------------------------- */}
      {/*                        Profile photo upload                          */}
      {/* -------------------------------------------------------------------- */}

      {modal === "avatar" && selectedDriver && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-modal-title"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <h2
                  id="avatar-modal-title"
                  className="text-lg font-bold text-slate-900 dark:text-white"
                >
                  Driver profile photo
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {getDriverName(selectedDriver)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={uploading}
                aria-label="Close photo upload"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAvatarUpload} className="p-5 sm:p-6">
              <div className="flex flex-col items-center">
                {uploadPreview ? (
                  <img
                    src={uploadPreview}
                    alt="Selected profile preview"
                    className="h-28 w-28 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : (
                  <DriverAvatar driver={selectedDriver} size="large" />
                )}

                <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {uploadFile ? uploadFile.name : "Current profile photo"}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  JPG, PNG, or WebP · Maximum 5 MB
                </p>
              </div>

              <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 px-4 py-7 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-400/5">
                <Upload
                  size={23}
                  className="text-blue-600 dark:text-blue-400"
                />
                <span className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Choose a profile image
                </span>
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select an image from your computer
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploading}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className={primaryButtonClass}
                >
                  {uploading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <ImagePlus size={17} />
                  )}
                  {uploading ? "Uploading..." : "Upload photo"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/*                            Delete confirmation                       */}
      {/* -------------------------------------------------------------------- */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-driver-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400">
              <Trash2 size={22} />
            </div>

            <h2
              id="delete-driver-title"
              className="mt-4 text-lg font-bold text-slate-900 dark:text-white"
            >
              Delete driver?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              You are about to delete{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {getDriverName(deleteTarget)}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={submitting}
                className={secondaryButtonClass}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
                {submitting ? "Deleting..." : "Delete Driver"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
