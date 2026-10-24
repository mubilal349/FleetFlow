"use client";

import { useCallback, useEffect, useState } from "react";

type DispatchStatus =
  | "pending"
  | "assigned"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "cancelled";

interface Dispatch {
  _id?: string;
  id?: string;
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
  createdAt: string;
}

interface DispatchForm {
  tripId: string;
  vehicleId: string;
  driverId: string;
  scheduledAt: string;
  notes: string;
}

const API_URL = "/api/dispatches";

const initialForm: DispatchForm = {
  tripId: "",
  vehicleId: "",
  driverId: "",
  scheduledAt: "",
  notes: "",
};

const statusStyles: Record<DispatchStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  dispatched:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  in_progress:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function getId(dispatch: Dispatch) {
  return dispatch._id ?? dispatch.id ?? "";
}

function getArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === "object") {
    const result = payload as Record<string, unknown>;

    if (Array.isArray(result.data)) return result.data as T[];
    if (Array.isArray(result.dispatches)) return result.dispatches as T[];
  }

  return [];
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function readableStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [form, setForm] = useState<DispatchForm>(initialForm);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("fleetflow_token") ?? "";
  };

  const request = async (url: string, options: RequestInit = {}) => {
    const token = getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        payload?.message ??
        payload?.error ??
        `Request failed (${response.status})`;

      throw new Error(message);
    }

    return payload;
  };

  const loadDispatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}?page=1&limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.message ?? payload?.error ?? "Unable to load dispatches.",
        );
      }

      setDispatches(getArray<Dispatch>(payload));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dispatches.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDispatches();
  }, [loadDispatches]);

  const updateForm = (field: keyof DispatchForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createDispatch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const body: Record<string, string> = {
        tripId: form.tripId.trim(),
      };

      if (form.vehicleId.trim()) body.vehicleId = form.vehicleId.trim();
      if (form.driverId.trim()) body.driverId = form.driverId.trim();
      if (form.scheduledAt) {
        body.scheduledAt = new Date(form.scheduledAt).toISOString();
      }
      if (form.notes.trim()) body.notes = form.notes.trim();

      await request(API_URL, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setForm(initialForm);
      setShowForm(false);
      setNotice("Dispatch created successfully.");
      await loadDispatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create dispatch.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (
    dispatch: Dispatch,
    action: "dispatch" | "start" | "complete" | "cancel" | "assign",
  ) => {
    const id = getId(dispatch);

    if (!id) {
      setError("This dispatch has no valid ID.");
      return;
    }

    let body: Record<string, string> | undefined;

    if (action === "assign") {
      const vehicleId = window.prompt("Enter the vehicle ID:");
      if (!vehicleId?.trim()) return;

      const driverId = window.prompt("Enter the driver ID:");
      if (!driverId?.trim()) return;

      body = {
        vehicleId: vehicleId.trim(),
        driverId: driverId.trim(),
      };
    }

    if (action === "cancel") {
      const reason = window.prompt("Enter the cancellation reason:");

      if (!reason?.trim()) return;

      body = { reason: reason.trim() };
    }

    if (
      action !== "assign" &&
      action !== "cancel" &&
      !window.confirm(`Are you sure you want to ${action} this dispatch?`)
    ) {
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await request(`${API_URL}/${encodeURIComponent(id)}/${action}`, {
        method: "POST",
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      setNotice(`Dispatch ${action.replaceAll("_", " ")} action successful.`);
      await loadDispatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The action failed.");
    } finally {
      setBusyId("");
    }
  };

  const filteredDispatches = dispatches.filter((dispatch) => {
    const matchesStatus = filter === "all" || dispatch.status === filter;

    const term = search.toLowerCase().trim();

    const matchesSearch =
      !term ||
      [
        getId(dispatch),
        dispatch.tripId,
        dispatch.vehicleId ?? "",
        dispatch.driverId ?? "",
      ].some((value) => value.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  const counts = {
    total: dispatches.length,
    pending: dispatches.filter((item) => item.status === "pending").length,
    active: dispatches.filter(
      (item) =>
        item.status === "assigned" ||
        item.status === "dispatched" ||
        item.status === "in_progress",
    ).length,
    completed: dispatches.filter((item) => item.status === "completed").length,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              FleetFlow Operations
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Dispatch Management
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Coordinate trips, drivers, vehicles, and dispatch progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadDispatches()}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={() => {
                setShowForm((value) => !value);
                setError("");
                setNotice("");
              }}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {showForm ? "Close Form" : "+ Create Dispatch"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            {notice}
          </div>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Dispatches",
              value: counts.total,
              icon: "↗",
              color: "text-blue-600",
            },
            {
              label: "Awaiting Assignment",
              value: counts.pending,
              icon: "◷",
              color: "text-amber-600",
            },
            {
              label: "Active Dispatches",
              value: counts.active,
              icon: "⇢",
              color: "text-violet-600",
            },
            {
              label: "Completed",
              value: counts.completed,
              icon: "✓",
              color: "text-emerald-600",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <span className={`text-xl ${card.color}`}>{card.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </section>

        {/* Create dispatch form */}
        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Create a Dispatch</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter an existing trip ID. Vehicle and driver IDs are optional
                when creating an unassigned dispatch.
              </p>
            </div>

            <form onSubmit={createDispatch} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Trip ID <span className="text-red-500">*</span>
                  <input
                    required
                    value={form.tripId}
                    onChange={(event) =>
                      updateForm("tripId", event.target.value)
                    }
                    placeholder="Enter existing trip ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium">
                  Scheduled Date & Time
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(event) =>
                      updateForm("scheduledAt", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium">
                  Vehicle ID
                  <input
                    value={form.vehicleId}
                    onChange={(event) =>
                      updateForm("vehicleId", event.target.value)
                    }
                    placeholder="Optional vehicle ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium">
                  Driver ID
                  <input
                    value={form.driverId}
                    onChange={(event) =>
                      updateForm("driverId", event.target.value)
                    }
                    placeholder="Optional driver ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium md:col-span-2">
                  Notes
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    placeholder="Optional dispatch instructions"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold dark:border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Dispatch"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dispatch, trip, vehicle, or driver ID..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </section>

        {/* Dispatch table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="font-bold">Dispatch Records</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredDispatches.length} record(s) shown
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading dispatch records...
            </div>
          ) : filteredDispatches.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl text-slate-300">⇢</div>
              <h3 className="mt-3 font-semibold">No dispatches found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create a dispatch or adjust your search and filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-4">Dispatch / Trip</th>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Driver</th>
                    <th className="px-5 py-4">Scheduled</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDispatches.map((dispatch) => {
                    const id = getId(dispatch);
                    const isBusy = busyId === id;

                    return (
                      <tr
                        key={id || dispatch.tripId}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {id ? `#${id.slice(-8)}` : "—"}
                          </p>
                          <p className="mt-1 max-w-44 truncate text-xs text-slate-500">
                            Trip: {dispatch.tripId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium">
                            {dispatch.vehicleId || "Unassigned"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium">
                            {dispatch.driverId || "Unassigned"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {formatDate(dispatch.scheduledAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              statusStyles[dispatch.status] ??
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {readableStatus(dispatch.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex max-w-80 flex-wrap gap-2">
                            {dispatch.status === "pending" && (
                              <ActionButton
                                label="Assign"
                                disabled={isBusy}
                                onClick={() =>
                                  void runAction(dispatch, "assign")
                                }
                              />
                            )}

                            {dispatch.status === "assigned" && (
                              <ActionButton
                                label="Dispatch"
                                disabled={isBusy}
                                onClick={() =>
                                  void runAction(dispatch, "dispatch")
                                }
                              />
                            )}

                            {dispatch.status === "dispatched" && (
                              <ActionButton
                                label="Start"
                                disabled={isBusy}
                                onClick={() =>
                                  void runAction(dispatch, "start")
                                }
                              />
                            )}

                            {dispatch.status === "in_progress" && (
                              <ActionButton
                                label="Complete"
                                disabled={isBusy}
                                onClick={() =>
                                  void runAction(dispatch, "complete")
                                }
                              />
                            )}

                            {!["completed", "cancelled"].includes(
                              dispatch.status,
                            ) && (
                              <ActionButton
                                label="Cancel"
                                disabled={isBusy}
                                danger
                                onClick={() =>
                                  void runAction(dispatch, "cancel")
                                }
                              />
                            )}

                            {isBusy && (
                              <span className="self-center text-xs text-slate-500">
                                Working...
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
          : "border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}
