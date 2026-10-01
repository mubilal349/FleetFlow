import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

export type PdfTheme = "light" | "dark";

interface VehicleDocumentPdfData {
  vehicleId: string;
  organizationId: string;
  documentType: string;
  title: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  status: "valid" | "expiring" | "expired";
  notes?: string;
  theme?: PdfTheme;
}

interface PdfColors {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  white: string;
}

// ==========================================
// THEME
// ==========================================

function getThemeColors(theme: PdfTheme): PdfColors {
  if (theme === "dark") {
    return {
      background: "#0B1220",
      surface: "#111A2E",
      text: "#F8FAFC",
      muted: "#94A3B8",
      border: "#1F2A44",
      accent: "#3B82F6",
      success: "#22C55E",
      successSoft: "#0F2E22",
      warning: "#F59E0B",
      warningSoft: "#3A2A0C",
      danger: "#EF4444",
      dangerSoft: "#3A1414",
      white: "#FFFFFF",
    };
  }

  return {
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    accent: "#2563EB",
    success: "#16A34A",
    successSoft: "#DCFCE7",
    warning: "#D97706",
    warningSoft: "#FEF3C7",
    danger: "#DC2626",
    dangerSoft: "#FEE2E2",
    white: "#FFFFFF",
  };
}

// ==========================================
// HELPERS
// ==========================================

function formatDate(date?: Date, long = false) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: long ? "long" : "short",
    day: "numeric",
  });
}

function formatDocumentType(type: string) {
  return String(type || "other")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getStatusMeta(
  status: VehicleDocumentPdfData["status"],
  colors: PdfColors,
) {
  switch (status) {
    case "valid":
      return { label: "Valid", fg: colors.success, bg: colors.successSoft };
    case "expiring":
      return { label: "Expiring", fg: colors.warning, bg: colors.warningSoft };
    case "expired":
      return { label: "Expired", fg: colors.danger, bg: colors.dangerSoft };
    default:
      return { label: "Unknown", fg: colors.muted, bg: colors.surface };
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(date?: Date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / DAY_MS);
}

function getProgress(issue?: Date, expiry?: Date) {
  if (!issue || !expiry) return null;

  const start = new Date(issue).getTime();
  const end = new Date(expiry).getTime();

  if (end <= start) return 1;

  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
}

function pluralDays(n: number) {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

// ==========================================
// GENERATOR
// ==========================================

export function generateVehicleDocumentPdf(
  data: VehicleDocumentPdfData,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const theme: PdfTheme = data.theme ?? "light";
      const colors = getThemeColors(theme);
      const status = getStatusMeta(data.status, colors);

      // ---------- file setup ----------
      const uploadDirectory = path.join(process.cwd(), "uploads", "documents");
      fs.mkdirSync(uploadDirectory, { recursive: true });

      const safeTitle =
        String(data.title || "vehicle-document")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .replace(/-+/g, "-")
          .toLowerCase()
          .slice(0, 50) || "vehicle-document";

      const filename = `${safeTitle}-${Date.now()}.pdf`;
      const filePath = path.join(uploadDirectory, filename);

      const pdf = new PDFDocument({
        size: "A4",
        margin: 0,
        info: {
          Title: data.title,
          Author: "FleetFlow",
          Subject: "FleetFlow Vehicle Document",
          Creator: "FleetFlow Vehicle Document Service",
        },
      });

      const stream = fs.createWriteStream(filePath);
      pdf.pipe(stream);

      // ---------- layout constants ----------
      const PAGE_W = 595.28;
      const PAGE_H = 841.89;
      const margin = 48;
      const cw = PAGE_W - margin * 2;

      // ---------- background ----------
      pdf.rect(0, 0, PAGE_W, PAGE_H).fill(colors.background);

      // ==========================================
      // HEADER
      // ==========================================

      pdf.roundedRect(margin, 44, 28, 28, 8).fill(colors.accent);

      pdf
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(colors.white)
        .text("F", margin, 51, { width: 28, align: "center" });

      pdf
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(colors.text)
        .text("FleetFlow", margin + 38, 52, { lineBreak: false });

      pdf
        .font("Helvetica")
        .fontSize(8)
        .fillColor(colors.muted)
        .text("VEHICLE DOCUMENT", margin, 54, {
          width: cw,
          align: "right",
          characterSpacing: 1.2,
          lineBreak: false,
        });

      // ==========================================
      // TITLE + STATUS PILL
      // ==========================================

      const titleY = 120;
      const titleWidth = cw - 130;

      pdf.font("Helvetica-Bold").fontSize(28).fillColor(colors.text);

      const titleText = data.title || "Vehicle Document";
      const titleHeight = Math.min(
        pdf.heightOfString(titleText, { width: titleWidth }),
        68,
      );

      pdf.text(titleText, margin, titleY, {
        width: titleWidth,
        height: 68,
        ellipsis: true,
      });

      pdf
        .font("Helvetica")
        .fontSize(10)
        .fillColor(colors.muted)
        .text(
          `${formatDocumentType(data.documentType)}  ·  ${
            data.documentNumber || "No document number"
          }`,
          margin,
          titleY + titleHeight + 8,
          { width: titleWidth, lineBreak: false, ellipsis: true },
        );

      // Status pill (top right of title block)
      const pillW = 112;
      const pillH = 32;
      const pillX = margin + cw - pillW;
      const pillY = titleY + 6;

      pdf.roundedRect(pillX, pillY, pillW, pillH, pillH / 2).fill(status.bg);
      pdf.circle(pillX + 20, pillY + pillH / 2, 4).fill(status.fg);

      pdf
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(status.fg)
        .text(status.label.toUpperCase(), pillX + 32, pillY + 11, {
          width: pillW - 40,
          characterSpacing: 0.8,
          lineBreak: false,
        });

      // ==========================================
      // VALIDITY CARD (hero)
      // ==========================================

      const cardY = titleY + titleHeight + 52;
      const cardH = 168;

      pdf
        .roundedRect(margin, cardY, cw, cardH, 16)
        .fillAndStroke(colors.surface, colors.border);

      const days = daysUntil(data.expiryDate);
      const pad = 28;

      let bigNumber = "—";
      let unitLabel = "No expiry date";
      let headline = "No expiry set";
      let subline = "This document does not have an expiry date.";

      if (days !== null) {
        if (days < 0) {
          bigNumber = String(Math.abs(days));
          unitLabel = Math.abs(days) === 1 ? "day overdue" : "days overdue";
          headline = "This document has expired";
          subline = `It expired on ${formatDate(data.expiryDate, true)}. Renew it as soon as possible.`;
        } else if (days === 0) {
          bigNumber = "0";
          unitLabel = "days left";
          headline = "Expires today";
          subline = "Renew this document today to stay compliant.";
        } else {
          bigNumber = String(days);
          unitLabel = days === 1 ? "day left" : "days left";
          headline =
            data.status === "expiring"
              ? "Renewal recommended soon"
              : `Valid for ${pluralDays(days)}`;
          subline =
            data.status === "expiring"
              ? `Expires on ${formatDate(data.expiryDate, true)}.`
              : `Valid until ${formatDate(data.expiryDate, true)}.`;
        }
      }

      // Big number
      pdf
        .font("Helvetica-Bold")
        .fontSize(46)
        .fillColor(status.fg)
        .text(bigNumber, margin + pad, cardY + 24, {
          width: 150,
          lineBreak: false,
        });

      pdf
        .font("Helvetica")
        .fontSize(9)
        .fillColor(colors.muted)
        .text(unitLabel.toUpperCase(), margin + pad, cardY + 80, {
          width: 150,
          characterSpacing: 1,
          lineBreak: false,
        });

      // Divider between number and message
      pdf
        .moveTo(margin + 190, cardY + 26)
        .lineTo(margin + 190, cardY + 92)
        .lineWidth(1)
        .strokeColor(colors.border)
        .stroke();

      // Headline + subline
      pdf
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(colors.text)
        .text(headline, margin + 214, cardY + 30, {
          width: cw - 214 - pad,
        });

      pdf
        .font("Helvetica")
        .fontSize(10)
        .fillColor(colors.muted)
        .text(subline, margin + 214, cardY + 54, {
          width: cw - 214 - pad,
          lineGap: 3,
        });

      // Progress bar
      const progress = getProgress(data.issueDate, data.expiryDate);

      if (progress !== null) {
        const barX = margin + pad;
        const barY = cardY + 118;
        const barW = cw - pad * 2;
        const barH = 8;

        pdf.roundedRect(barX, barY, barW, barH, barH / 2).fill(colors.border);

        const fillW = Math.max(barH, barW * progress);

        pdf.roundedRect(barX, barY, fillW, barH, barH / 2).fill(status.fg);

        // Marker for "today"
        pdf
          .circle(barX + fillW - barH / 2, barY + barH / 2, 7)
          .lineWidth(3)
          .fillAndStroke(colors.white, status.fg);

        pdf
          .font("Helvetica")
          .fontSize(8)
          .fillColor(colors.muted)
          .text(`Issued  ${formatDate(data.issueDate)}`, barX, barY + 22, {
            width: barW / 2,
            lineBreak: false,
          });

        pdf.text(
          `Expires  ${formatDate(data.expiryDate)}`,
          barX + barW / 2,
          barY + 22,
          {
            width: barW / 2,
            align: "right",
            lineBreak: false,
          },
        );
      }

      // ==========================================
      // DETAILS (clean two-column grid)
      // ==========================================

      const detailsY = cardY + cardH + 40;

      pdf
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(colors.text)
        .text("Details", margin, detailsY, { lineBreak: false });

      const items: Array<[string, string]> = [
        ["Document number", data.documentNumber || "N/A"],
        ["Document type", formatDocumentType(data.documentType)],
        ["Vehicle", data.vehicleId],
        ["Organization", data.organizationId],
        ["Issue date", formatDate(data.issueDate, true)],
        ["Expiry date", formatDate(data.expiryDate, true)],
      ];

      const rowH = 48;
      const colW = cw / 2;
      const gridY = detailsY + 26;

      items.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + col * colW;
        const y = gridY + row * rowH;

        pdf
          .moveTo(x, y)
          .lineTo(x + colW - (col === 0 ? 20 : 0), y)
          .lineWidth(0.75)
          .strokeColor(colors.border)
          .stroke();

        pdf
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(colors.muted)
          .text(label.toUpperCase(), x, y + 12, {
            width: colW - 24,
            characterSpacing: 0.8,
            lineBreak: false,
          });

        pdf
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(colors.text)
          .text(value, x, y + 25, {
            width: colW - 24,
            lineBreak: false,
            ellipsis: true,
          });
      });

      // ==========================================
      // NOTES
      // ==========================================

      const notesY = gridY + Math.ceil(items.length / 2) * rowH + 28;
      const footerY = 790;

      pdf
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(colors.text)
        .text("Notes", margin, notesY, { lineBreak: false });

      const notesTextY = notesY + 24;
      const notesMaxH = Math.max(30, footerY - notesTextY - 24);

      pdf.font("Helvetica").fontSize(10);

      const notesText = data.notes?.trim() || "No additional notes.";
      const notesH = Math.min(
        pdf.heightOfString(notesText, { width: cw - 16, lineGap: 4 }),
        notesMaxH,
      );

      // Accent bar
      pdf
        .roundedRect(margin, notesTextY, 3, notesH, 1.5)
        .fill(data.notes?.trim() ? colors.accent : colors.border);

      pdf
        .font("Helvetica")
        .fontSize(10)
        .fillColor(data.notes?.trim() ? colors.text : colors.muted)
        .text(notesText, margin + 16, notesTextY, {
          width: cw - 16,
          height: notesMaxH,
          lineGap: 4,
          ellipsis: true,
        });

      // ==========================================
      // FOOTER
      // ==========================================

      pdf
        .moveTo(margin, footerY)
        .lineTo(margin + cw, footerY)
        .lineWidth(0.75)
        .strokeColor(colors.border)
        .stroke();

      pdf
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(colors.muted)
        .text("FleetFlow  ·  Vehicle Document Service", margin, footerY + 14, {
          width: cw / 2,
          lineBreak: false,
        });

      pdf.text(
        `Generated ${formatDate(new Date(), true)}`,
        margin + cw / 2,
        footerY + 14,
        { width: cw / 2, align: "right", lineBreak: false },
      );

      // ==========================================
      // FINISH
      // ==========================================

      pdf.end();

      stream.on("finish", () => resolve(`/uploads/documents/${filename}`));
      stream.on("error", reject);
      pdf.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}
