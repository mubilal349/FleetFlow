"use client";

import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Eye,
  FileText,
  Filter,
  Gauge,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../components/dashboard/DashboardSidebar";

import { useSidebar } from "@/context/SidebarContext";

type InspectionType =
  | "pre_trip"
  | "post_trip"
  | "routine"
  | "safety"
  | "maintenance"
  | "annual";

type ChecklistStatus = "pass" | "fail" | "needs_attention" | "not_checked";

type InspectionResult = "passed" | "failed" | "needs_attention";

type InspectionStatus = "draft" | "completed" | "cancelled";

interface Checklist {
  engine: ChecklistStatus;
  brakes: ChecklistStatus;
  tires: ChecklistStatus;
  lights: ChecklistStatus;
  battery: ChecklistStatus;
  fluids: ChecklistStatus;
  exterior: ChecklistStatus;
  interior: ChecklistStatus;
  safetyEquipment: ChecklistStatus;
}

interface Inspection {
  _id: string;
  organizationId: string;
  vehicleId: string;
  inspectorId: string;
  inspectionType: InspectionType;
  inspectionDate: string;
  mileage: number;
  checklist: Checklist;
  overallResult: InspectionResult;
  notes?: string;
  issues: string[];
  status: InspectionStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const inspectionTypes: {
  value: InspectionType;
  label: string;
}[] = [
  {
    value: "pre_trip",
    label: "Pre-Trip",
  },
  {
    value: "post_trip",
    label: "Post-Trip",
  },
  {
    value: "routine",
    label: "Routine",
  },
  {
    value: "safety",
    label: "Safety",
  },
  {
    value: "maintenance",
    label: "Maintenance",
  },
  {
    value: "annual",
    label: "Annual",
  },
];

const checklistItems: {
  key: keyof Checklist;
  label: string;
}[] = [
  {
    key: "engine",
    label: "Engine",
  },
  {
    key: "brakes",
    label: "Brakes",
  },
  {
    key: "tires",
    label: "Tires",
  },
  {
    key: "lights",
    label: "Lights",
  },
  {
    key: "battery",
    label: "Battery",
  },
  {
    key: "fluids",
    label: "Fluids",
  },
  {
    key: "exterior",
    label: "Exterior",
  },
  {
    key: "interior",
    label: "Interior",
  },
  {
    key: "safetyEquipment",
    label: "Safety Equipment",
  },
];

const emptyChecklist: Checklist = {
  engine: "not_checked",
  brakes: "not_checked",
  tires: "not_checked",
  lights: "not_checked",
  battery: "not_checked",
  fluids: "not_checked",
  exterior: "not_checked",
  interior: "not_checked",
  safetyEquipment: "not_checked",
};

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("fleetflow_token");
}

function formatInspectionType(type: InspectionType) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateTime(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getStatusClasses(status: InspectionStatus) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400";

    case "draft":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";

    case "cancelled":
      return "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function getResultClasses(result: InspectionResult) {
  switch (result) {
    case "passed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400";

    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";

    case "needs_attention":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function getChecklistClasses(status: ChecklistStatus) {
  switch (status) {
    case "pass":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400";

    case "fail":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400";

    case "needs_attention":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400";

    default:
      return "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400";
  }
}

function getChecklistLabel(status: ChecklistStatus) {
  switch (status) {
    case "pass":
      return "Pass";

    case "fail":
      return "Fail";

    case "needs_attention":
      return "Attention";

    case "not_checked":
      return "Not Checked";
  }
}

function calculateResult(checklist: Checklist): InspectionResult {
  const values = Object.values(checklist);

  if (values.includes("fail")) {
    return "failed";
  }

  if (values.includes("needs_attention")) {
    return "needs_attention";
  }

  if (values.every((value) => value === "pass")) {
    return "passed";
  }

  return "needs_attention";
}

export default function VehicleInspectionsPage() {
  const { collapsed } = useSidebar();

  const [inspections, setInspections] = useState<Inspection[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "all">(
    "all",
  );

  const [resultFilter, setResultFilter] = useState<InspectionResult | "all">(
    "all",
  );

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);

  const [form, setForm] = useState({
    vehicleId: "",
    inspectorId: "",
    inspectionType: "pre_trip" as InspectionType,
    inspectionDate: "",
    mileage: "",
    checklist: { ...emptyChecklist },
    notes: "",
    issues: "",
  });

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (resultFilter !== "all") {
        params.set("overallResult", resultFilter);
      }

      const queryString = params.toString();

      const response = await fetch(
        `${API_BASE_URL}/api/inspections${queryString ? `?${queryString}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = (await response.json()) as ApiResponse<Inspection[]>;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to retrieve vehicle inspections.",
        );
      }

      setInspections(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load inspections.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInspections();
  }, [statusFilter, resultFilter]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  const filteredInspections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return inspections;
    }

    return inspections.filter((inspection) => {
      return (
        inspection.vehicleId.toLowerCase().includes(query) ||
        inspection.inspectorId.toLowerCase().includes(query) ||
        formatInspectionType(inspection.inspectionType)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [inspections, search]);

  const stats = useMemo(() => {
    return {
      total: inspections.length,

      completed: inspections.filter(
        (inspection) => inspection.status === "completed",
      ).length,

      pending: inspections.filter((inspection) => inspection.status === "draft")
        .length,

      failed: inspections.filter(
        (inspection) => inspection.overallResult === "failed",
      ).length,
    };
  }, [inspections]);

  const resetForm = () => {
    setForm({
      vehicleId: "",
      inspectorId: "",
      inspectionType: "pre_trip",
      inspectionDate: "",
      mileage: "",
      checklist: { ...emptyChecklist },
      notes: "",
      issues: "",
    });
  };

  const handleCreateInspection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      if (!form.vehicleId.trim()) {
        throw new Error("Vehicle ID is required.");
      }

      if (!form.inspectorId.trim()) {
        throw new Error("Inspector ID is required.");
      }

      if (!form.mileage.trim()) {
        throw new Error("Mileage is required.");
      }

      const payload = {
        vehicleId: form.vehicleId.trim(),
        inspectorId: form.inspectorId.trim(),
        inspectionType: form.inspectionType,

        ...(form.inspectionDate
          ? {
              inspectionDate: new Date(form.inspectionDate).toISOString(),
            }
          : {}),

        mileage: Number(form.mileage),

        checklist: form.checklist,

        overallResult: calculateResult(form.checklist),

        notes: form.notes.trim() || undefined,

        issues: form.issues
          .split("\n")
          .map((issue) => issue.trim())
          .filter(Boolean),
      };

      const response = await fetch(`${API_BASE_URL}/api/inspections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ApiResponse<Inspection>;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create inspection.");
      }

      setSuccess("Vehicle inspection created successfully.");

      setShowCreateModal(false);

      resetForm();

      await fetchInspections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create inspection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (inspection: Inspection) => {
    try {
      setActionLoading(inspection._id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/inspections/${inspection._id}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = (await response.json()) as ApiResponse<Inspection>;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to complete inspection.");
      }

      setSuccess("Vehicle inspection completed successfully.");

      await fetchInspections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete inspection.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (inspection: Inspection) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this inspection?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(inspection._id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/inspections/${inspection._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: "Inspection cancelled from FleetFlow dashboard.",
          }),
        },
      );

      const result = (await response.json()) as ApiResponse<Inspection>;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel inspection.");
      }

      setSuccess("Vehicle inspection cancelled successfully.");

      await fetchInspections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel inspection.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (inspection: Inspection) => {
    const confirmed = window.confirm("Delete this inspection permanently?");

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(inspection._id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/inspections/${inspection._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = (await response.json()) as ApiResponse<Inspection>;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete inspection.");
      }

      setSuccess("Vehicle inspection deleted successfully.");

      await fetchInspections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete inspection.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      {/* Existing FleetFlow Sidebar */}
      <DashboardSidebar />

      {/* Same content offset used by Assignment page */}
      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
        }`}
      >
        {/* Existing FleetFlow Header */}
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <ClipboardCheck className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Vehicle Inspections
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Inspect fleet vehicles, monitor safety checks, and maintain
                  complete inspection history.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              New Inspection
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0" />

                <span>{error}</span>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle2 className="h-[18px] w-[18px]" />

              <span>{success}</span>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Inspections"
              value={stats.total}
              icon="total"
              description="All recorded inspections"
            />

            <StatCard
              label="Completed"
              value={stats.completed}
              icon="completed"
              description="Successfully completed"
            />

            <StatCard
              label="Pending"
              value={stats.pending}
              icon="pending"
              description="Draft inspections"
            />

            <StatCard
              label="Failed"
              value={stats.failed}
              icon="failed"
              description="Require attention"
            />
          </div>

          {/* Inspection Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            {/* Toolbar */}
            <div className="border-b border-slate-200 px-4 py-5 dark:border-slate-800 sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="font-bold">Inspection History</h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Review vehicle inspections and safety results.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search vehicle, inspector..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-[250px] dark:border-slate-700 dark:bg-slate-950/50"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value as InspectionStatus | "all",
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm outline-none dark:border-slate-700 dark:bg-slate-950/50 sm:w-[170px]"
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <div className="relative">
                    <select
                      value={resultFilter}
                      onChange={(event) =>
                        setResultFilter(
                          event.target.value as InspectionResult | "all",
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-9 text-sm outline-none dark:border-slate-700 dark:bg-slate-950/50 sm:w-[170px]"
                    >
                      <option value="all">All Results</option>
                      <option value="passed">Passed</option>
                      <option value="needs_attention">Needs Attention</option>
                      <option value="failed">Failed</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  <button
                    type="button"
                    onClick={() => void fetchInspections()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    <th className="px-6 py-4">Vehicle</th>

                    <th className="px-6 py-4">Inspection</th>

                    <th className="px-6 py-4">Inspector</th>

                    <th className="px-6 py-4">Date</th>

                    <th className="px-6 py-4">Mileage</th>

                    <th className="px-6 py-4">Result</th>

                    <th className="px-6 py-4">Status</th>

                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <LoadingRows columns={8} />
                  ) : filteredInspections.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                          <ClipboardCheck className="h-7 w-7" />
                        </div>

                        <p className="mt-4 font-semibold">
                          No inspections found
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Start by creating a vehicle inspection.
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                          }}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          Create Inspection
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredInspections.map((inspection) => (
                      <tr
                        key={inspection._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        {/* Vehicle */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                              <Wrench className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold">
                                {inspection.vehicleId}
                              </p>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Fleet Vehicle
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Inspection */}
                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold">
                            {formatInspectionType(inspection.inspectionType)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            ID: {inspection._id.slice(-8)}
                          </p>
                        </td>

                        {/* Inspector */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium">
                            {inspection.inspectorId}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-slate-400" />

                            {formatDate(inspection.inspectionDate)}
                          </div>
                        </td>

                        {/* Mileage */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm">
                            <Gauge className="h-4 w-4 text-slate-400" />
                            {formatNumber(inspection.mileage)} km
                          </div>
                        </td>

                        {/* Result */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getResultClasses(
                              inspection.overallResult,
                            )}`}
                          >
                            {inspection.overallResult
                              .replaceAll("_", " ")
                              .replace(/^\w/, (char) => char.toUpperCase())}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              inspection.status,
                            )}`}
                          >
                            {inspection.status.replace(/^\w/, (char) =>
                              char.toUpperCase(),
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="View inspection"
                              onClick={() => setSelectedInspection(inspection)}
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                            >
                              View
                            </button>

                            {inspection.status === "draft" && (
                              <>
                                <button
                                  type="button"
                                  title="Complete inspection"
                                  disabled={actionLoading === inspection._id}
                                  onClick={() =>
                                    void handleComplete(inspection)
                                  }
                                  className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                >
                                  {actionLoading === inspection._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  title="Cancel inspection"
                                  disabled={actionLoading === inspection._id}
                                  onClick={() => void handleCancel(inspection)}
                                  className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            {inspection.status !== "completed" && (
                              <button
                                type="button"
                                title="Delete inspection"
                                disabled={actionLoading === inspection._id}
                                onClick={() => void handleDelete(inspection)}
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Inspection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      New Vehicle Inspection
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Record a complete vehicle safety inspection.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateInspection}
              className="max-h-[calc(92vh-82px)] overflow-y-auto"
            >
              <div className="space-y-7 p-6">
                {/* Basic Information */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">
                        Inspection Information
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Basic inspection details
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField label="Vehicle ID" required>
                      <input
                        type="text"
                        value={form.vehicleId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            vehicleId: event.target.value,
                          }))
                        }
                        placeholder="Enter vehicle ID"
                        className={inputClass}
                        required
                      />
                    </FormField>

                    <FormField label="Inspector ID" required>
                      <input
                        type="text"
                        value={form.inspectorId}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            inspectorId: event.target.value,
                          }))
                        }
                        placeholder="Enter inspector ID"
                        className={inputClass}
                        required
                      />
                    </FormField>

                    <FormField label="Inspection Type" required>
                      <select
                        value={form.inspectionType}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            inspectionType: event.target
                              .value as InspectionType,
                          }))
                        }
                        className={inputClass}
                      >
                        {inspectionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Inspection Date">
                      <input
                        type="datetime-local"
                        value={form.inspectionDate}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            inspectionDate: event.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Current Mileage" required>
                      <input
                        type="number"
                        min="0"
                        value={form.mileage}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            mileage: event.target.value,
                          }))
                        }
                        placeholder="e.g. 45200"
                        className={inputClass}
                        required
                      />
                    </FormField>
                  </div>
                </section>

                {/* Checklist */}
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">Vehicle Checklist</h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Check every component before completing the inspection.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {checklistItems.map((item) => {
                      const currentStatus = form.checklist[item.key];

                      return (
                        <div
                          key={item.key}
                          className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">
                              {item.label}
                            </span>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getChecklistClasses(
                                currentStatus,
                              )}`}
                            >
                              {getChecklistLabel(currentStatus)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5">
                            <ChecklistButton
                              active={currentStatus === "pass"}
                              label="Pass"
                              onClick={() =>
                                setForm((current) => ({
                                  ...current,
                                  checklist: {
                                    ...current.checklist,
                                    [item.key]: "pass",
                                  },
                                }))
                              }
                            />

                            <ChecklistButton
                              active={currentStatus === "needs_attention"}
                              label="Attention"
                              onClick={() =>
                                setForm((current) => ({
                                  ...current,
                                  checklist: {
                                    ...current.checklist,
                                    [item.key]: "needs_attention",
                                  },
                                }))
                              }
                            />

                            <ChecklistButton
                              active={currentStatus === "fail"}
                              label="Fail"
                              onClick={() =>
                                setForm((current) => ({
                                  ...current,
                                  checklist: {
                                    ...current.checklist,
                                    [item.key]: "fail",
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Result Preview */}
                <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        Calculated Inspection Result
                      </p>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        The backend will recalculate the final result when the
                        inspection is completed.
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getResultClasses(
                        calculateResult(form.checklist),
                      )}`}
                    >
                      {calculateResult(form.checklist)
                        .replaceAll("_", " ")
                        .replace(/^\w/, (char) => char.toUpperCase())}
                    </span>
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />

                    <h3 className="text-sm font-bold">Notes & Issues</h3>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <FormField label="Notes">
                      <textarea
                        rows={4}
                        value={form.notes}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        placeholder="Add inspection notes..."
                        className={`${inputClass} resize-none`}
                      />
                    </FormField>

                    <FormField label="Issues" hint="One issue per line">
                      <textarea
                        rows={4}
                        value={form.issues}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            issues: event.target.value,
                          }))
                        }
                        placeholder={"Brake pads worn\nLeft headlight damaged"}
                        className={`${inputClass} resize-none`}
                      />
                    </FormField>
                  </div>
                </section>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedInspection && (
        <InspectionDetailsModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white";

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: "total" | "completed" | "pending" | "failed";
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          {icon === "total" && <ClipboardCheck className="h-5 w-5" />}

          {icon === "completed" && <CheckCircle2 className="h-5 w-5" />}

          {icon === "pending" && <Clock3 className="h-5 w-5" />}

          {icon === "failed" && <XCircle className="h-5 w-5" />}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </span>

        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>

      {children}
    </label>
  );
}

function ChecklistButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition ${
        active
          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function LoadingRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-6 py-5">
              <div className="h-4 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function InspectionDetailsModal({
  inspection,
  onClose,
}: {
  inspection: Inspection;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Eye className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold">Inspection Details</h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatDateTime(inspection.inspectionDate)}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Vehicle" value={inspection.vehicleId} />

            <DetailItem label="Inspector" value={inspection.inspectorId} />

            <DetailItem
              label="Type"
              value={formatInspectionType(inspection.inspectionType)}
            />

            <DetailItem
              label="Mileage"
              value={`${formatNumber(inspection.mileage)} km`}
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getResultClasses(
                inspection.overallResult,
              )}`}
            >
              Result: {inspection.overallResult.replaceAll("_", " ")}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                inspection.status,
              )}`}
            >
              Status: {inspection.status}
            </span>
          </div>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />

              <h3 className="font-bold">Checklist</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {checklistItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <span className="text-sm font-medium">{item.label}</span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getChecklistClasses(
                      inspection.checklist[item.key],
                    )}`}
                  >
                    {getChecklistLabel(inspection.checklist[item.key])}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {inspection.issues.length > 0 && (
            <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              <div className="mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />

                <h3 className="font-bold">Reported Issues</h3>
              </div>

              <ul className="space-y-2">
                {inspection.issues.map((issue, index) => (
                  <li
                    key={`${issue}-${index}`}
                    className="text-sm text-slate-600 dark:text-slate-300"
                  >
                    • {issue}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {inspection.notes && (
            <section className="mt-6">
              <h3 className="mb-3 font-bold">Notes</h3>

              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                {inspection.notes}
              </p>
            </section>
          )}

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Created"
              value={formatDateTime(inspection.createdAt)}
            />

            <DetailItem
              label="Last Updated"
              value={formatDateTime(inspection.updatedAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}
