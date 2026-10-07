"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../../../components/dashboard/DashboardSidebar";

import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

/* =========================================================
   TYPES
========================================================= */

type DocumentType =
  | "registration"
  | "insurance"
  | "road_permit"
  | "fitness"
  | "inspection"
  | "pollution"
  | "other";

type DocumentStatus = "valid" | "expiring" | "expired";

interface VehicleDocument {
  _id: string;
  vehicleId: string;
  organizationId: string;
  documentType: DocumentType;
  title: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  pdfUrl?: string;
  status: DocumentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  document?: T;
  documents?: T[];
}

interface DocumentForm {
  documentType: DocumentType;
  title: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
}

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/$/, "");

/* =========================================================
   DOCUMENT TYPES
========================================================= */

const documentTypes: {
  value: DocumentType;
  label: string;
}[] = [
  {
    value: "registration",
    label: "Registration",
  },
  {
    value: "insurance",
    label: "Insurance",
  },
  {
    value: "road_permit",
    label: "Road Permit",
  },
  {
    value: "fitness",
    label: "Fitness Certificate",
  },
  {
    value: "inspection",
    label: "Inspection",
  },
  {
    value: "pollution",
    label: "Pollution Certificate",
  },
  {
    value: "other",
    label: "Other",
  },
];

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm: DocumentForm = {
  documentType: "registration",
  title: "",
  documentNumber: "",
  issueDate: "",
  expiryDate: "",
  notes: "",
};

/* =========================================================
   HELPERS
========================================================= */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("fleetflow_token");
}

function formatDocumentType(type: DocumentType) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date?: string) {
  if (!date) {
    return "N/A";
  }

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

function getStatusClasses(status: DocumentStatus) {
  switch (status) {
    case "valid":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400";

    case "expiring":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";

    case "expired":
      return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function getStatusLabel(status: DocumentStatus) {
  switch (status) {
    case "valid":
      return "Valid";

    case "expiring":
      return "Expiring Soon";

    case "expired":
      return "Expired";

    default:
      return status;
  }
}

/**
 * Converts the backend PDF path into a browser-accessible URL.
 *
 * Example:
 *
 * /uploads/documents/def-1790842667880.pdf
 *
 * becomes:
 *
 * http://localhost:4000/uploads/documents/def-1790842667880.pdf
 *
 * IMPORTANT:
 * We use pdfUrl, NOT fileUrl.
 */
function getPdfUrl(pdfUrl?: string) {
  if (!pdfUrl) {
    return null;
  }

  if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
    return pdfUrl;
  }

  if (pdfUrl.startsWith("file://")) {
    return null;
  }

  const normalizedPath = pdfUrl.startsWith("/") ? pdfUrl : `/${pdfUrl}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Safely parse JSON responses.
 */
async function parseApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text) {
    return {
      success: response.ok,
    };
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: text || `Request failed with status ${response.status}`,
    };
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function VehicleDocumentsPage() {
  const { user } = useAuth();
  const canManageDocuments = user?.role === "admin" || user?.role === "manager";
  const { collapsed } = useSidebar();

  /*
   * FleetFlow's existing theme.
   *
   * We don't change the layout or theme.
   * We only read the current theme so the backend can
   * generate a PDF using the same dashboard mode.
   */
  const { theme } = useTheme();

  const params = useParams();
  const router = useRouter();

  const vehicleId = Array.isArray(params.vehicleId)
    ? params.vehicleId[0]
    : params.vehicleId;

  const [documents, setDocuments] = useState<VehicleDocument[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /*
   * NEW:
   * Tracks which document is currently regenerating.
   */
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState<VehicleDocument | null>(null);

  const [form, setForm] = useState<DocumentForm>({
    ...emptyForm,
  });

  /* =======================================================
     FETCH DOCUMENTS
  ======================================================= */

  const fetchDocuments = useCallback(async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/vehicles/${vehicleId}/documents`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      const result = await parseApiResponse<VehicleDocument>(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to retrieve vehicle documents.",
        );
      }

      setDocuments(result.documents || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load vehicle documents.",
      );
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  /* =======================================================
     SUCCESS MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    return {
      total: documents.length,

      valid: documents.filter((document) => document.status === "valid").length,

      expiring: documents.filter((document) => document.status === "expiring")
        .length,

      expired: documents.filter((document) => document.status === "expired")
        .length,
    };
  }, [documents]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });
  };

  /* =======================================================
     CREATE DOCUMENT
  ======================================================= */

  const handleCreateDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      if (!vehicleId) {
        throw new Error("Vehicle ID is missing.");
      }

      if (!form.title.trim()) {
        throw new Error("Document title is required.");
      }

      if (form.issueDate && form.expiryDate) {
        const issueDate = new Date(form.issueDate);
        const expiryDate = new Date(form.expiryDate);

        if (expiryDate < issueDate) {
          throw new Error("Expiry date cannot be before issue date.");
        }
      }

      const payload = {
        vehicleId,
        documentType: form.documentType,
        title: form.title.trim(),
        documentNumber: form.documentNumber.trim() || undefined,
        issueDate: form.issueDate || undefined,
        expiryDate: form.expiryDate || undefined,
        notes: form.notes.trim() || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/vehicles/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await parseApiResponse<VehicleDocument>(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to create vehicle document.",
        );
      }

      setSuccess("Vehicle document created and PDF generated successfully.");

      setShowCreateModal(false);

      resetForm();

      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create vehicle document.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     REGENERATE PDF
  ======================================================= */

  const handleRegeneratePdf = async (document: VehicleDocument) => {
    try {
      setRegeneratingId(document._id);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      /*
       * Use the CURRENT FleetFlow dashboard theme.
       *
       * Expected backend value:
       *
       * "dark"
       * "light"
       */
      const pdfTheme = theme === "dark" ? "dark" : "light";

      const response = await fetch(
        `${API_BASE_URL}/api/vehicles/documents/${document._id}/regenerate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            theme: pdfTheme,
          }),
        },
      );

      const result = await parseApiResponse<VehicleDocument>(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to regenerate vehicle document PDF.",
        );
      }

      /*
       * Backend should return the updated document.
       *
       * We update the existing row immediately so the new
       * PDF URL is available without changing the layout.
       */
      if (result.document) {
        setDocuments((currentDocuments) =>
          currentDocuments.map((item) =>
            item._id === document._id
              ? {
                  ...item,
                  ...result.document,
                }
              : item,
          ),
        );

        /*
         * Keep the details modal synchronized too.
         */
        setSelectedDocument((current) => {
          if (!current || current._id !== document._id) {
            return current;
          }

          return {
            ...current,
            ...result.document,
          };
        });
      } else {
        /*
         * If the backend only returns success, fetch the
         * document list again.
         */
        await fetchDocuments();
      }

      setSuccess(
        `PDF regenerated successfully using ${
          pdfTheme === "dark" ? "dark" : "light"
        } theme.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to regenerate vehicle document PDF.",
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  /* =======================================================
     DELETE DOCUMENT
  ======================================================= */

  const handleDelete = async (document: VehicleDocument) => {
    const confirmed = window.confirm(`Delete "${document.title}" permanently?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(document._id);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/vehicles/documents/${document._id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await parseApiResponse<VehicleDocument>(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to delete vehicle document.",
        );
      }

      setSuccess("Vehicle document deleted successfully.");

      if (selectedDocument?._id === document._id) {
        setSelectedDocument(null);
      }

      await fetchDocuments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete vehicle document.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

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
          {/* PAGE HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/vehicles/${vehicleId}`)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                title="Back to vehicle"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Vehicle Documents
                  </h1>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage registrations, insurance, permits, certificates, and
                  other vehicle documents.
                </p>
              </div>
            </div>

            {canManageDocuments && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Add Document
              </button>
            )}
          </div>

          {/* ERROR */}

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

          {/* SUCCESS */}

          {success && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle2 className="h-[18px] w-[18px]" />

              <span>{success}</span>
            </div>
          )}

          {/* STATISTICS */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Documents"
              value={stats.total}
              icon="total"
              description="All vehicle documents"
            />

            <StatCard
              label="Valid"
              value={stats.valid}
              icon="valid"
              description="Currently valid documents"
            />

            <StatCard
              label="Expiring Soon"
              value={stats.expiring}
              icon="expiring"
              description="Require renewal soon"
            />

            <StatCard
              label="Expired"
              value={stats.expired}
              icon="expired"
              description="Require immediate attention"
            />
          </div>

          {/* DOCUMENTS CARD */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="border-b border-slate-200 px-4 py-5 dark:border-slate-800 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold">Vehicle Documents</h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Review and manage all documents associated with this
                    vehicle.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void fetchDocuments()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[350px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading vehicle documents...
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <FileText className="h-7 w-7" />
                </div>

                <p className="mt-4 font-semibold">No documents found</p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add registration, insurance, permits, or other documents for
                  this vehicle.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add First Document
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                      <th className="px-6 py-4">Document</th>

                      <th className="px-6 py-4">Type</th>

                      <th className="px-6 py-4">Document No.</th>

                      <th className="px-6 py-4">Issue Date</th>

                      <th className="px-6 py-4">Expiry Date</th>

                      <th className="px-6 py-4">Status</th>

                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {documents.map((document) => {
                      const pdfUrl = getPdfUrl(document.pdfUrl);

                      const isRegenerating = regeneratingId === document._id;

                      return (
                        <tr
                          key={document._id}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold">
                                  {document.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  ID: {document._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-medium">
                              {formatDocumentType(document.documentType)}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {document.documentNumber || "N/A"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-400" />

                              {formatDate(document.issueDate)}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-400" />

                              {formatDate(document.expiryDate)}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                document.status,
                              )}`}
                            >
                              {getStatusLabel(document.status)}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-1.5">
                              {pdfUrl ? (
                                <>
                                  {/* VIEW PDF */}

                                  <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="View PDF"
                                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>

                                  {/* DOWNLOAD PDF */}

                                  <a
                                    href={pdfUrl}
                                    download
                                    title="Download PDF"
                                    className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </>
                              ) : (
                                <span
                                  className="px-2 text-xs text-slate-400"
                                  title="No generated PDF"
                                >
                                  No PDF
                                </span>
                              )}

                              {/* REGENERATE PDF */}

                              <button
                                type="button"
                                title={
                                  isRegenerating
                                    ? "Regenerating PDF"
                                    : "Regenerate PDF"
                                }
                                disabled={isRegenerating}
                                onClick={() =>
                                  void handleRegeneratePdf(document)
                                }
                                className="rounded-lg p-2 text-violet-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-violet-400 dark:hover:bg-violet-950/30"
                              >
                                {isRegenerating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </button>

                              {/* VIEW DETAILS */}

                              <button
                                type="button"
                                title="View details"
                                onClick={() => setSelectedDocument(document)}
                                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <ClipboardList className="h-4 w-4" />
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                title="Delete document"
                                disabled={deletingId === document._id}
                                onClick={() => void handleDelete(document)}
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30"
                              >
                                {deletingId === document._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
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
            )}
          </div>
        </main>
      </div>

      {/* ===================================================
          ADD DOCUMENT MODAL
      =================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">Add Vehicle Document</h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Enter the document information. FleetFlow will
                      automatically generate a PDF.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateDocument}
              className="max-h-[calc(92vh-82px)] overflow-y-auto"
            >
              <div className="space-y-7 p-6">
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                      <ClipboardList className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold">
                        Document Information
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Information used to generate the PDF document
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Document Type" required>
                      <select
                        value={form.documentType}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            documentType: event.target.value as DocumentType,
                          }))
                        }
                        className={inputClass}
                        required
                      >
                        {documentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Document Title" required>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        placeholder="e.g. Vehicle Registration Certificate"
                        className={inputClass}
                        required
                      />
                    </FormField>

                    <FormField label="Document Number">
                      <input
                        type="text"
                        value={form.documentNumber}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            documentNumber: event.target.value,
                          }))
                        }
                        placeholder="e.g. REG-123456"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Issue Date">
                      <input
                        type="date"
                        value={form.issueDate}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            issueDate: event.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Expiry Date">
                      <input
                        type="date"
                        value={form.expiryDate}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            expiryDate: event.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                    <div>
                      <p className="text-sm font-bold">
                        Automatic PDF Generation
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        When you click <strong>Add Document</strong>, FleetFlow
                        will save your information and automatically generate a
                        downloadable PDF document.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />

                    <h3 className="text-sm font-bold">Notes</h3>
                  </div>

                  <FormField label="Additional Notes">
                    <textarea
                      rows={5}
                      value={form.notes}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Add additional information about this document..."
                      className={`${inputClass} resize-none`}
                    />
                  </FormField>
                </section>

                <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

                    <div>
                      <p className="text-sm font-bold">Automatic Status</p>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        FleetFlow automatically determines whether the document
                        is valid, expiring, or expired based on its expiry date.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}

                  {submitting ? "Generating PDF..." : "Add Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DETAILS MODAL
      =================================================== */}

      {selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onRegenerate={() => void handleRegeneratePdf(selectedDocument)}
          regenerating={regeneratingId === selectedDocument._id}
        />
      )}
    </div>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white";

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: "total" | "valid" | "expiring" | "expired";
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
          {icon === "total" && <FileText className="h-5 w-5" />}

          {icon === "valid" && <CheckCircle2 className="h-5 w-5" />}

          {icon === "expiring" && <Calendar className="h-5 w-5" />}

          {icon === "expired" && <AlertCircle className="h-5 w-5" />}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
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
      <div className="mb-1.5">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      </div>

      {children}
    </label>
  );
}

/* =========================================================
   DOCUMENT DETAILS MODAL
========================================================= */

function DocumentDetailsModal({
  document,
  onClose,
  onRegenerate,
  regenerating,
}: {
  document: VehicleDocument;
  onClose: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  /*
   * IMPORTANT:
   *
   * Use document.pdfUrl because this is the URL
   * generated by the backend PDF service.
   */
  const pdfUrl = getPdfUrl(document.pdfUrl);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold">Document Details</h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {document.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={regenerating}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}

        <div className="max-h-[calc(90vh-82px)] overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Document Title" value={document.title} />

            <DetailItem
              label="Document Type"
              value={formatDocumentType(document.documentType)}
            />

            <DetailItem
              label="Document Number"
              value={document.documentNumber || "N/A"}
            />

            <DetailItem label="Vehicle ID" value={document.vehicleId} />

            <DetailItem
              label="Issue Date"
              value={formatDate(document.issueDate)}
            />

            <DetailItem
              label="Expiry Date"
              value={formatDate(document.expiryDate)}
            />
          </div>

          {/* STATUS */}

          <div className="mt-5">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                document.status,
              )}`}
            >
              Status: {getStatusLabel(document.status)}
            </span>
          </div>

          {/* PDF ACTIONS */}

          {pdfUrl ? (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

                <div className="flex-1">
                  <h3 className="text-sm font-bold">Generated PDF</h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Your vehicle document has been generated as a PDF.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {/* VIEW PDF */}

                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View PDF
                    </a>

                    {/* DOWNLOAD PDF */}

                    <a
                      href={pdfUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>

                    {/* REGENERATE PDF */}

                    <button
                      type="button"
                      onClick={onRegenerate}
                      disabled={regenerating}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {regenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}

                      {regenerating ? "Regenerating..." : "Regenerate PDF"}
                    </button>
                  </div>

                  <p className="mt-3 break-all text-[11px] text-slate-400">
                    {pdfUrl}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />

                <div>
                  <p className="text-sm font-semibold">PDF not available</p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    This document does not have a generated PDF yet.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onRegenerate}
                disabled={regenerating}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {regenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}

                {regenerating ? "Regenerating..." : "Generate PDF"}
              </button>
            </div>
          )}

          {/* NOTES */}

          {document.notes && (
            <section className="mt-6">
              <h3 className="mb-3 font-bold">Notes</h3>

              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                {document.notes}
              </p>
            </section>
          )}

          {/* CREATED / UPDATED */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Created"
              value={formatDate(document.createdAt)}
            />

            <DetailItem
              label="Last Updated"
              value={formatDate(document.updatedAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

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
