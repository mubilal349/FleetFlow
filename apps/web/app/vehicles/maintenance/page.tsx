"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";

// =====================================================
// API CONFIG
// =====================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// =====================================================
// TYPES
// =====================================================

type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "overdue";

type MaintenancePriority = "low" | "medium" | "high" | "critical";

interface Maintenance {
  _id: string;
  organizationId: string;
  vehicleId: string;
  serviceType: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  reminderDays: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MaintenanceListResponse {
  success: boolean;
  message?: string;
  count?: number;
  maintenances: Maintenance[];
}

interface MaintenanceResponse {
  success: boolean;
  message?: string;
  maintenance?: Maintenance;
}

// =====================================================
// HELPERS
// =====================================================

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClasses(status: MaintenanceStatus) {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

    case "in_progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

    case "completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "overdue":
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400";
  }
}

function getPriorityClasses(priority: MaintenancePriority) {
  switch (priority) {
    case "low":
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400";

    case "medium":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";

    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400";
  }
}

function getStatusLabel(status: MaintenanceStatus) {
  switch (status) {
    case "in_progress":
      return "In Progress";

    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// =====================================================
// COMPONENT
// =====================================================

export default function MaintenancePage() {
  const { collapsed } = useSidebar();

  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceStatus>(
    "all",
  );

  const [priorityFilter, setPriorityFilter] = useState<
    "all" | MaintenancePriority
  >("all");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ===================================================
  // FORM
  // ===================================================

  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "",
    description: "",
    scheduledDate: "",
    completedDate: "",
    status: "scheduled" as MaintenanceStatus,
    priority: "medium" as MaintenancePriority,
    reminderDays: 7,
    notes: "",
  });

  // ===================================================
  // FETCH MAINTENANCE RECORDS
  // ===================================================

  const fetchMaintenances = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("fleetflow_token");

      const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result: MaintenanceListResponse = await response.json();

      console.log("Maintenance API response:", result);

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch maintenance records",
        );
      }

      if (!result.success) {
        throw new Error(
          result.message || "Failed to fetch maintenance records",
        );
      }

      setMaintenances(result.maintenances || []);
    } catch (err) {
      console.error("Fetch maintenance error:", err);

      setMaintenances([]);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load maintenance records",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchMaintenances();
  }, []);

  // ===================================================
  // FILTERED DATA
  // ===================================================

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((maintenance) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        maintenance.vehicleId.toLowerCase().includes(searchValue) ||
        maintenance.serviceType.toLowerCase().includes(searchValue) ||
        maintenance.description?.toLowerCase().includes(searchValue) ||
        maintenance.notes?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || maintenance.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || maintenance.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [maintenances, search, statusFilter, priorityFilter]);

  // ===================================================
  // STATS
  // ===================================================

  const stats = useMemo(() => {
    return {
      total: maintenances.length,

      scheduled: maintenances.filter((item) => item.status === "scheduled")
        .length,

      inProgress: maintenances.filter((item) => item.status === "in_progress")
        .length,

      completed: maintenances.filter((item) => item.status === "completed")
        .length,

      overdue: maintenances.filter((item) => item.status === "overdue").length,
    };
  }, [maintenances]);

  // ===================================================
  // CREATE MAINTENANCE
  // ===================================================

  const handleCreateMaintenance = async (event: FormEvent) => {
    event.preventDefault();

    if (
      !formData.vehicleId.trim() ||
      !formData.serviceType.trim() ||
      !formData.scheduledDate
    ) {
      setError("Vehicle ID, service type and scheduled date are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const token = localStorage.getItem("fleetflow_token");

      const payload = {
        vehicleId: formData.vehicleId.trim(),
        serviceType: formData.serviceType.trim(),
        description: formData.description.trim() || undefined,
        scheduledDate: formData.scheduledDate,
        completedDate: formData.completedDate || undefined,
        status: formData.status,
        priority: formData.priority,
        reminderDays: Number(formData.reminderDays),
        notes: formData.notes.trim() || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: MaintenanceResponse = await response.json();

      console.log("Create maintenance response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to create maintenance");
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to create maintenance");
      }

      setSuccess("Maintenance record created successfully.");

      setShowCreateModal(false);

      resetForm();

      // Refresh table with newly created record.
      await fetchMaintenances(true);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Create maintenance error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create maintenance record",
      );
    } finally {
      setCreating(false);
    }
  };

  // ===================================================
  // DELETE MAINTENANCE
  // ===================================================

  const handleDelete = async (maintenanceId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance record?",
    );

    if (!confirmed) return;

    try {
      setDeleting(maintenanceId);
      setError("");

      const token = localStorage.getItem("fleetflow_token");

      const response = await fetch(
        `${API_BASE_URL}/api/maintenance/${maintenanceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete maintenance");
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to delete maintenance");
      }

      setSuccess("Maintenance record deleted successfully.");

      await fetchMaintenances(true);

      if (selectedMaintenance?._id === maintenanceId) {
        setSelectedMaintenance(null);
      }

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Delete maintenance error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete maintenance record",
      );
    } finally {
      setDeleting(null);
    }
  };

  // ===================================================
  // RESET FORM
  // ===================================================

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      serviceType: "",
      description: "",
      scheduledDate: "",
      completedDate: "",
      status: "scheduled",
      priority: "medium",
      reminderDays: 7,
      notes: "",
    });
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#050816] dark:text-white">
      <DashboardSidebar />

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
        }`}
      >
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* ================================================= */}
          {/* PAGE HEADER */}
          {/* ================================================= */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <Wrench size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Vehicle Maintenance
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage vehicle servicing, maintenance schedules and
                    maintenance history.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setError("");
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus size={18} />
              New Maintenance
            </button>
          </div>

          {/* ================================================= */}
          {/* ALERTS */}
          {/* ================================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />

              <span className="flex-1">{error}</span>

              <button onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />

              <span className="flex-1">{success}</span>

              <button onClick={() => setSuccess("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {/* ================================================= */}
          {/* STATS */}
          {/* ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {/* Total */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1224]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total
                  </p>

                  <p className="mt-2 text-2xl font-bold">{stats.total}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Wrench size={20} />
                </div>
              </div>
            </div>

            {/* Scheduled */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1224]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Scheduled
                  </p>

                  <p className="mt-2 text-2xl font-bold">{stats.scheduled}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Calendar size={20} />
                </div>
              </div>
            </div>

            {/* In Progress */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1224]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    In Progress
                  </p>

                  <p className="mt-2 text-2xl font-bold">{stats.inProgress}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Clock size={20} />
                </div>
              </div>
            </div>

            {/* Completed */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1224]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Completed
                  </p>

                  <p className="mt-2 text-2xl font-bold">{stats.completed}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            {/* Overdue */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1224]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Overdue
                  </p>

                  <p className="mt-2 text-2xl font-bold">{stats.overdue}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* MAINTENANCE HISTORY */}
          {/* ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1224]">
            <div className="border-b border-slate-200 p-4 dark:border-white/10 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Maintenance History</h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    View and manage all vehicle maintenance records.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {/* Search */}

                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search maintenance..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d] sm:w-56"
                    />
                  </div>

                  {/* Status */}

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as "all" | MaintenanceStatus,
                      )
                    }
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-white/10 dark:bg-[#070d1d]"
                  >
                    <option value="all">All Status</option>

                    <option value="scheduled">Scheduled</option>

                    <option value="in_progress">In Progress</option>

                    <option value="completed">Completed</option>

                    <option value="overdue">Overdue</option>
                  </select>

                  {/* Priority */}

                  <select
                    value={priorityFilter}
                    onChange={(event) =>
                      setPriorityFilter(
                        event.target.value as "all" | MaintenancePriority,
                      )
                    }
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none dark:border-white/10 dark:bg-[#070d1d]"
                  >
                    <option value="all">All Priority</option>

                    <option value="low">Low</option>

                    <option value="medium">Medium</option>

                    <option value="high">High</option>

                    <option value="critical">Critical</option>
                  </select>

                  {/* Refresh */}

                  <button
                    onClick={() => fetchMaintenances(true)}
                    disabled={refreshing}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#070d1d] dark:hover:bg-white/5"
                  >
                    <RefreshCw
                      size={16}
                      className={refreshing ? "animate-spin" : ""}
                    />

                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#070d1d]">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Vehicle
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Service Type
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Scheduled Date
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Priority
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={6} className="px-5 py-5">
                          <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                        </td>
                      </tr>
                    ))
                  ) : filteredMaintenances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5">
                          <Wrench size={22} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold">
                          No maintenance records found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Create a maintenance record to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMaintenances.map((maintenance) => (
                      <tr
                        key={maintenance._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      >
                        {/* Vehicle */}

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {maintenance.vehicleId}
                          </div>

                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            ID: {maintenance._id.slice(-8)}
                          </div>
                        </td>

                        {/* Service */}

                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {maintenance.serviceType}
                          </div>

                          {maintenance.description && (
                            <div className="mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                              {maintenance.description}
                            </div>
                          )}
                        </td>

                        {/* Date */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={15} className="text-slate-400" />

                            {formatDate(maintenance.scheduledDate)}
                          </div>
                        </td>

                        {/* Priority */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityClasses(
                              maintenance.priority,
                            )}`}
                          >
                            {maintenance.priority}
                          </span>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              maintenance.status,
                            )}`}
                          >
                            {getStatusLabel(maintenance.status)}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                setSelectedMaintenance(maintenance)
                              }
                              title="View Details"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-blue-400"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(maintenance._id)}
                              disabled={deleting === maintenance._id}
                              title="Delete"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                            >
                              {deleting === maintenance._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ================================================= */}
            {/* TABLE FOOTER */}
            {/* ================================================= */}

            {!loading && filteredMaintenances.length > 0 && (
              <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {filteredMaintenances.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {maintenances.length}
                </span>{" "}
                maintenance records
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================================================= */}
      {/* CREATE MODAL */}
      {/* ================================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1224]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-semibold">Create Maintenance</h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add a new vehicle maintenance record.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance}>
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                {/* Vehicle */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Vehicle ID *
                  </label>

                  <input
                    type="text"
                    value={formData.vehicleId}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        vehicleId: event.target.value,
                      })
                    }
                    placeholder="Enter vehicle ID"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d]"
                  />
                </div>

                {/* Service Type */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Service Type *
                  </label>

                  <input
                    type="text"
                    value={formData.serviceType}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        serviceType: event.target.value,
                      })
                    }
                    placeholder="e.g. Oil Change"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d]"
                  />
                </div>

                {/* Scheduled Date */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Scheduled Date *
                  </label>

                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        scheduledDate: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d]"
                  />
                </div>

                {/* Completed Date */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Completed Date
                  </label>

                  <input
                    type="datetime-local"
                    value={formData.completedDate}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        completedDate: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d]"
                  />
                </div>

                {/* Status */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        status: event.target.value as MaintenanceStatus,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-[#070d1d]"
                  >
                    <option value="scheduled">Scheduled</option>

                    <option value="in_progress">In Progress</option>

                    <option value="completed">Completed</option>

                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                {/* Priority */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        priority: event.target.value as MaintenancePriority,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-[#070d1d]"
                  >
                    <option value="low">Low</option>

                    <option value="medium">Medium</option>

                    <option value="high">High</option>

                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Reminder */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Reminder Days
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={formData.reminderDays}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        reminderDays: Number(event.target.value),
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d]"
                  />
                </div>

                {/* Description */}

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe the maintenance work..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d]"
                  />
                </div>

                {/* Notes */}

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Additional notes..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#070d1d]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Maintenance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* DETAILS MODAL */}
      {/* ================================================= */}

      {selectedMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1224]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-semibold">Maintenance Details</h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Complete maintenance record information.
                </p>
              </div>

              <button
                onClick={() => setSelectedMaintenance(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              {/* Top */}

              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#070d1d]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Wrench size={20} />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {selectedMaintenance.serviceType}
                    </p>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Vehicle: {selectedMaintenance.vehicleId}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                      selectedMaintenance.priority,
                    )}`}
                  >
                    {selectedMaintenance.priority}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      selectedMaintenance.status,
                    )}`}
                  >
                    {getStatusLabel(selectedMaintenance.status)}
                  </span>
                </div>
              </div>

              {/* Information */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Vehicle ID
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {selectedMaintenance.vehicleId}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Service Type
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {selectedMaintenance.serviceType}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Scheduled Date
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(selectedMaintenance.scheduledDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Completed Date
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(selectedMaintenance.completedDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Reminder
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {selectedMaintenance.reminderDays} days
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(selectedMaintenance.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description */}

              {selectedMaintenance.description && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Description
                  </p>

                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 dark:border-white/10 dark:bg-[#070d1d]">
                    {selectedMaintenance.description}
                  </div>
                </div>
              )}

              {/* Notes */}

              {selectedMaintenance.notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Notes
                  </p>

                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 dark:border-white/10 dark:bg-[#070d1d]">
                    {selectedMaintenance.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <button
                onClick={() => setSelectedMaintenance(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
