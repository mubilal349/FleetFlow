"use client";

import { useEffect, useState, type ReactNode } from "react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type UserRole = "admin" | "manager" | "driver" | "customer";

type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

interface VehicleRequest {
  _id: string;
  organizationId: string;
  customerId: string;
  vehicleId: string;

  purpose: string;
  pickupLocation: string;
  destination: string;

  startDate: string;
  endDate: string;

  notes?: string;

  status: RequestStatus;

  rejectionReason?: string;

  reviewedBy?: string;
  reviewedAt?: string;

  createdAt: string;
  updatedAt: string;
}

interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  status: string;
}

interface RequestListResponse {
  success: boolean;
  message: string;
  data: {
    requests: VehicleRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface VehicleResponse {
  success: boolean;
  data: {
    vehicle: Vehicle;
  };
}

const statusStyles: Record<RequestStatus, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",

  approved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",

  rejected: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",

  cancelled:
    "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const statusLabels: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function VehicleRequestPage() {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  const role = user?.role as UserRole | undefined;

  const isCustomer = role === "customer";
  const isManager = role === "manager";
  const isAdmin = role === "admin";

  const canReviewRequests = isAdmin || isManager;

  const [requests, setRequests] = useState<VehicleRequest[]>([]);

  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest | null>(
    null,
  );

  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  const [approveLoading, setApproveLoading] = useState<string | null>(null);

  const [rejectLoading, setRejectLoading] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);

  const [rejectingRequest, setRejectingRequest] =
    useState<VehicleRequest | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const [actionError, setActionError] = useState("");

  const fetchRequests = async () => {
    if (!role) {
      return;
    }

    if (role !== "customer" && role !== "admin" && role !== "manager") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoint = canReviewRequests
        ? `/api/vehicle-requests/admin?page=${page}&limit=10`
        : `/api/vehicle-requests?page=${page}&limit=10`;

      const response = await api.get<RequestListResponse>(endpoint);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to load vehicle requests.",
        );
      }

      const requestData = response.data.data;

      const requestList = requestData.requests || [];

      setRequests(requestList);
      setTotal(requestData.total || 0);
      setTotalPages(requestData.totalPages || 1);

      /*
       * Fetch vehicle information for the
       * vehicles referenced by these requests.
       */
      const uniqueVehicleIds = [
        ...new Set(requestList.map((request) => request.vehicleId)),
      ];

      if (uniqueVehicleIds.length > 0) {
        const vehicleResults = await Promise.all(
          uniqueVehicleIds.map(async (vehicleId) => {
            try {
              const vehicleResponse = await api.get<VehicleResponse>(
                `/api/vehicles/${vehicleId}`,
              );

              return {
                vehicleId,
                vehicle: vehicleResponse.data?.data?.vehicle || null,
              };
            } catch {
              return {
                vehicleId,
                vehicle: null,
              };
            }
          }),
        );

        const vehicleMap: Record<string, Vehicle> = {};

        vehicleResults.forEach(({ vehicleId, vehicle }) => {
          if (vehicle) {
            vehicleMap[vehicleId] = vehicle;
          }
        });

        setVehicles(vehicleMap);
      } else {
        setVehicles({});
      }
    } catch (err: any) {
      console.error("Failed to fetch vehicle requests:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load vehicle requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      fetchRequests();
    }
  }, [role, page]);

  const handleCancelRequest = async (request: VehicleRequest) => {
    if (request.status !== "pending") {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this vehicle request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(request._id);
      setActionError("");

      const response = await api.patch(
        `/api/vehicle-requests/${request._id}/cancel`,
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to cancel request.");
      }

      setRequests((current) =>
        current.map((item) =>
          item._id === request._id
            ? {
                ...item,
                status: "cancelled",
              }
            : item,
        ),
      );

      setSelectedRequest((current) =>
        current?._id === request._id
          ? {
              ...current,
              status: "cancelled",
            }
          : current,
      );
    } catch (err: any) {
      console.error("Failed to cancel request:", err);

      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel request.",
      );
    } finally {
      setCancelLoading(null);
    }
  };

  const handleApproveRequest = async (request: VehicleRequest) => {
    if (request.status !== "pending") {
      return;
    }

    try {
      setApproveLoading(request._id);
      setActionError("");

      const response = await api.patch(
        `/api/vehicle-requests/${request._id}/approve`,
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to approve request.");
      }

      setRequests((current) =>
        current.map((item) =>
          item._id === request._id
            ? {
                ...item,
                status: "approved",
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.id,
              }
            : item,
        ),
      );

      setSelectedRequest((current) =>
        current?._id === request._id
          ? {
              ...current,
              status: "approved",
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.id,
            }
          : current,
      );
    } catch (err: any) {
      console.error("Failed to approve request:", err);

      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to approve request.",
      );
    } finally {
      setApproveLoading(null);
    }
  };

  const openRejectModal = (request: VehicleRequest) => {
    setRejectingRequest(request);
    setRejectionReason("");
    setActionError("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    if (rejectLoading) {
      return;
    }

    setShowRejectModal(false);
    setRejectingRequest(null);
    setRejectionReason("");
    setActionError("");
  };

  const handleRejectRequest = async () => {
    if (!rejectingRequest) {
      return;
    }

    const reason = rejectionReason.trim();

    if (reason.length < 3) {
      setActionError("Please provide a rejection reason.");
      return;
    }

    try {
      setRejectLoading(rejectingRequest._id);
      setActionError("");

      const response = await api.patch(
        `/api/vehicle-requests/${rejectingRequest._id}/reject`,
        {
          rejectionReason: reason,
        },
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to reject request.");
      }

      const reviewedAt = new Date().toISOString();

      setRequests((current) =>
        current.map((item) =>
          item._id === rejectingRequest._id
            ? {
                ...item,
                status: "rejected",
                rejectionReason: reason,
                reviewedAt,
                reviewedBy: user?.id,
              }
            : item,
        ),
      );

      setSelectedRequest((current) =>
        current?._id === rejectingRequest._id
          ? {
              ...current,
              status: "rejected",
              rejectionReason: reason,
              reviewedAt,
              reviewedBy: user?.id,
            }
          : current,
      );

      closeRejectModal();
    } catch (err: any) {
      console.error("Failed to reject request:", err);

      setActionError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject request.",
      );
    } finally {
      setRejectLoading(null);
    }
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString([], {
      dateStyle: "medium",
    });
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles[vehicleId];

    if (!vehicle) {
      return "Vehicle";
    }

    return `${vehicle.make} ${vehicle.model}`;
  };

  const getVehicleRegistration = (vehicleId: string) => {
    const vehicle = vehicles[vehicleId];

    return vehicle?.registrationNumber || vehicleId.slice(0, 10) + "...";
  };

  const pendingCount = requests.filter(
    (request) => request.status === "pending",
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "approved",
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected",
  ).length;

  /*
   * Drivers do not have access to this page.
   */
  if (user && role !== "customer" && role !== "admin" && role !== "manager") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050816] dark:text-white">
        <DashboardSidebar />

        <div
          className={`min-h-screen transition-[padding] duration-300 ${
            collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
          }`}
        >
          <DashboardHeader />

          <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>

              <h1 className="mt-5 text-2xl font-bold">Access Restricted</h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Vehicle requests are available to customers, managers, and
                administrators.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          {/* Page Header */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3h9l4 4v14H6z" />
                  <path d="M14 3v5h5" />
                  <path d="M9 13h5" />
                  <path d="M9 16h3" />
                  <path d="m15 17 1.5 1.5L20 15" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Vehicle Requests
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {canReviewRequests
                    ? "Review and manage vehicle requests from your organization."
                    : "Track your submitted vehicle requests and their status."}
                </p>
              </div>
            </div>

            {canReviewRequests && (
              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {isAdmin ? "Administrator" : "Manager"} Review
              </div>
            )}
          </div>

          {/* Stats */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Requests" value={total} icon="total" />

            <StatCard label="Pending" value={pendingCount} icon="pending" />

            <StatCard label="Approved" value={approvedCount} icon="approved" />

            <StatCard label="Rejected" value={rejectedCount} icon="rejected" />
          </div>

          {/* Error */}

          {(error || actionError) && (
            <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <div className="flex items-start gap-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-0.5 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>

                <span>{error || actionError}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setActionError("");
                }}
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

          {/* Request Table */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="font-bold">
                  {canReviewRequests
                    ? "Organization Requests"
                    : "My Request History"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {canReviewRequests
                    ? "Review vehicle requests submitted by customers."
                    : "Your submitted vehicle requests and their current status."}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    {canReviewRequests && (
                      <th className="px-6 py-4">Customer</th>
                    )}

                    <th className="px-6 py-4">Vehicle</th>

                    <th className="px-6 py-4">Purpose</th>

                    <th className="px-6 py-4">Route</th>

                    <th className="px-6 py-4">Schedule</th>

                    <th className="px-6 py-4">Status</th>

                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <LoadingRows columns={canReviewRequests ? 7 : 6} />
                  ) : requests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={canReviewRequests ? 7 : 6}
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                          <svg
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path d="M6 4h12v16H6z" />
                            <path d="M9 8h6" />
                            <path d="M9 12h6" />
                            <path d="M9 16h4" />
                          </svg>
                        </div>

                        <p className="mt-4 font-semibold">
                          No vehicle requests
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {canReviewRequests
                            ? "There are currently no requests to review."
                            : "Your submitted requests will appear here."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => {
                      const vehicle = vehicles[request.vehicleId];

                      return (
                        <tr
                          key={request._id}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          {/* Customer */}

                          {canReviewRequests && (
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                  {request.customerId.slice(0, 1).toUpperCase()}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold">
                                    Customer
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {request.customerId.slice(0, 10)}
                                    ...
                                  </p>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Vehicle */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                <svg
                                  width="19"
                                  height="19"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                >
                                  <path d="M5 17h14" />
                                  <path d="M6 17V9l2-4h8l2 4v8" />
                                  <path d="M4 11h16" />
                                  <circle cx="8" cy="17" r="2" />
                                  <circle cx="16" cy="17" r="2" />
                                </svg>
                              </div>

                              <div>
                                <p className="text-sm font-semibold">
                                  {vehicle
                                    ? `${vehicle.make} ${vehicle.model}`
                                    : getVehicleName(request.vehicleId)}
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {getVehicleRegistration(request.vehicleId)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Purpose */}

                          <td className="max-w-[190px] px-6 py-5">
                            <p className="truncate text-sm font-medium">
                              {request.purpose}
                            </p>

                            {request.notes && (
                              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                {request.notes}
                              </p>
                            )}
                          </td>

                          {/* Route */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="max-w-[100px] truncate">
                                {request.pickupLocation}
                              </span>

                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="shrink-0 text-slate-400"
                              >
                                <path d="M5 12h14" />
                                <path d="m13 6 6 6-6 6" />
                              </svg>

                              <span className="max-w-[100px] truncate">
                                {request.destination}
                              </span>
                            </div>
                          </td>

                          {/* Schedule */}

                          <td className="px-6 py-5">
                            <div className="text-sm">
                              <p className="font-medium">
                                {formatDate(request.startDate)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                to {formatDate(request.endDate)}
                              </p>
                            </div>
                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[request.status]}`}
                            >
                              {statusLabels[request.status]}
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedRequest(request)}
                                className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                              >
                                View
                              </button>

                              {isCustomer && request.status === "pending" && (
                                <button
                                  type="button"
                                  disabled={cancelLoading === request._id}
                                  onClick={() => handleCancelRequest(request)}
                                  className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                  {cancelLoading === request._id
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </button>
                              )}

                              {canReviewRequests &&
                                request.status === "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={approveLoading === request._id}
                                      onClick={() =>
                                        handleApproveRequest(request)
                                      }
                                      className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    >
                                      {approveLoading === request._id
                                        ? "Approving..."
                                        : "Approve"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => openRejectModal(request)}
                                      className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                      Reject
                                    </button>
                                  </>
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

            {/* Pagination */}

            {!loading && requests.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {requests.length} of {total} requests
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
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
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal */}

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          vehicle={vehicles[selectedRequest.vehicleId]}
          canReview={canReviewRequests}
          isCustomer={isCustomer}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => handleApproveRequest(selectedRequest)}
          onReject={() => openRejectModal(selectedRequest)}
          onCancel={() => handleCancelRequest(selectedRequest)}
          approveLoading={approveLoading === selectedRequest._id}
          cancelLoading={cancelLoading === selectedRequest._id}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Reject Modal */}

      {showRejectModal && rejectingRequest && (
        <RejectRequestModal
          request={rejectingRequest}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          loading={rejectLoading === rejectingRequest._id}
          error={actionError}
          onClose={closeRejectModal}
          onSubmit={handleRejectRequest}
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
  icon: "total" | "pending" | "approved" | "rejected";
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
          {icon === "total" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 4h12v16H6z" />
              <path d="M9 8h6" />
              <path d="M9 12h6" />
              <path d="M9 16h4" />
            </svg>
          )}

          {icon === "pending" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          )}

          {icon === "approved" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          )}

          {icon === "rejected" && (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m9 9 6 6" />
              <path d="m15 9-6 6" />
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

function LoadingRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({
            length: columns,
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

/* ============================================================
   REQUEST DETAILS MODAL
============================================================ */

function RequestDetailsModal({
  request,
  vehicle,
  canReview,
  isCustomer,
  onClose,
  onApprove,
  onReject,
  onCancel,
  approveLoading,
  cancelLoading,
  formatDateTime,
}: {
  request: VehicleRequest;
  vehicle?: Vehicle;
  canReview: boolean;
  isCustomer: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  approveLoading: boolean;
  cancelLoading: boolean;
  formatDateTime: (value: string) => string;
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
                  <path d="M6 3h9l4 4v14H6z" />
                  <path d="M14 3v5h5" />
                  <path d="M9 13h5" />
                  <path d="M9 16h3" />
                  <path d="m15 17 1.5 1.5L20 15" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold">Request Details</h2>

                <p className="mt-1 max-w-[300px] truncate text-xs text-slate-500 dark:text-slate-400">
                  ID: {request._id}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={approveLoading || cancelLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
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

          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/50">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Request Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[request.status]}`}
              >
                {statusLabels[request.status]}
              </span>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submitted
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatDateTime(request.createdAt)}
              </p>
            </div>
          </div>

          {/* Vehicle */}

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vehicle
            </h3>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 17h14" />
                  <path d="M6 17V9l2-4h8l2 4v8" />
                  <path d="M4 11h16" />
                  <circle cx="8" cy="17" r="2" />
                  <circle cx="16" cy="17" r="2" />
                </svg>
              </div>

              <div>
                <p className="font-bold">
                  {vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle"}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {vehicle?.registrationNumber || request.vehicleId}
                </p>

                {vehicle && (
                  <p className="mt-1 text-xs capitalize text-slate-400">
                    {vehicle.year} • {vehicle.vehicleType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer */}

          {canReview && (
            <div className="mt-7">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Customer
              </h3>

              <DetailItem label="Customer ID" value={request.customerId} />
            </div>
          )}

          {/* Request Information */}

          <div className="mt-7">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Request Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Purpose" value={request.purpose} />

              <DetailItem
                label="Pickup Location"
                value={request.pickupLocation}
              />

              <DetailItem label="Destination" value={request.destination} />

              <DetailItem
                label="Start"
                value={formatDateTime(request.startDate)}
              />

              <DetailItem label="End" value={formatDateTime(request.endDate)} />
            </div>
          </div>

          {/* Notes */}

          <div className="mt-7">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Notes
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
              {request.notes || "No additional notes were provided."}
            </div>
          </div>

          {/* Rejection */}

          {request.status === "rejected" && request.rejectionReason && (
            <div className="mt-7">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Rejection Reason
              </h3>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {request.rejectionReason}
              </div>
            </div>
          )}

          {/* Review */}

          {request.reviewedAt && (
            <div className="mt-7">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Review Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Reviewed At"
                  value={formatDateTime(request.reviewedAt)}
                />

                <DetailItem
                  label="Reviewed By"
                  value={request.reviewedBy || "Not provided"}
                />
              </div>
            </div>
          )}

          {/* Actions */}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={approveLoading || cancelLoading}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>

            {canReview && request.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={onReject}
                  disabled={approveLoading}
                  className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={onApprove}
                  disabled={approveLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {approveLoading && <Spinner />}

                  {approveLoading ? "Approving..." : "Approve Request"}
                </button>
              </>
            )}

            {isCustomer && request.status === "pending" && (
              <button
                type="button"
                onClick={onCancel}
                disabled={cancelLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelLoading && <Spinner />}

                {cancelLoading ? "Cancelling..." : "Cancel Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================
   REJECT MODAL
============================================================ */

function RejectRequestModal({
  request,
  rejectionReason,
  setRejectionReason,
  loading,
  error,
  onClose,
  onSubmit,
}: {
  request: VehicleRequest;
  rejectionReason: string;
  setRejectionReason: (value: string) => void;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 9 6 6" />
                  <path d="m15 9-6 6" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold">Reject Request</h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Provide a reason for rejecting this request.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
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
          {/* Request Summary */}

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Request
            </p>

            <p className="mt-1 font-semibold">{request.purpose}</p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {request.pickupLocation} → {request.destination}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <label
            htmlFor="rejectionReason"
            className="block text-sm font-semibold"
          >
            Rejection Reason
          </label>

          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            disabled={loading}
            maxLength={1000}
            rows={5}
            placeholder="Explain why this vehicle request is being rejected..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-500"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Minimum 3 characters</span>

            <span>{rejectionReason.length}/1000</span>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Spinner />}

              {loading ? "Rejecting..." : "Reject Request"}
            </button>
          </div>
        </div>
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
