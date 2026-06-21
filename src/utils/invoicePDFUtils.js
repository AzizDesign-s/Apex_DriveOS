// src/utils/invoicePDFUtils.js
// Generates a styled PDF for a single invoice using jsPDF.
// WHY separate from exportUtils.js:
//   exportUtils handles tabular data export (rows of records).
//   This file handles a single invoice rendered as a designed document.
//   This separation makes it easy to swap invoice styles in the future.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DEFAULT_COMPANY_INFO } from "../data/mockData";
import useAppStore from "../store/useAppStore";
import { calcInvoice } from "../data/mockData";

const company = useAppStore.getState().company;

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  gold: [212, 175, 55],
  dark: [11, 15, 20],
  cardBg: [13, 21, 38],
  border: [27, 46, 74],
  white: [255, 255, 255],
  text: [15, 23, 42],
  muted: [71, 85, 105],
  subtle: [148, 163, 184],
  emerald: [16, 185, 129],
  rose: [251, 113, 133],
  sky: [56, 189, 248],
  violet: [167, 139, 250],
  amber: [251, 191, 36],
  lightGray: [248, 250, 252],
  borderLight: [226, 232, 240],
  carBg: [255, 249, 230],
  carText: [146, 64, 14],
  serviceBg: [224, 242, 254],
  serviceText: [7, 89, 133],
  customBg: [243, 232, 255],
  customText: [107, 33, 168],
};

const fmtAED = (n) => Number(n || 0).toLocaleString("en-AE");
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-AE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ── Status badge color ────────────────────────────────────────────────────────
function getStatusColor(status) {
  switch (status) {
    case "paid":
      return { bg: [220, 252, 231], text: [22, 101, 52] };
    case "overdue":
      return { bg: [254, 226, 226], text: [153, 27, 27] };
    case "sent":
      return { bg: [224, 242, 254], text: [7, 89, 133] };
    case "partially_paid":
      return { bg: [243, 232, 255], text: [107, 33, 168] };
    case "refunded":
      return { bg: [254, 243, 199], text: [120, 53, 15] };
    case "cancelled":
      return { bg: [241, 245, 249], text: [71, 85, 105] };
    default:
      return { bg: [241, 245, 249], text: [71, 85, 105] }; // draft
  }
}

// ── Main export function ──────────────────────────────────────────────────────
export function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.width; // 210mm
  const H = doc.internal.pageSize.height; // 297mm
  const PAD = 16; // left/right margin

  const { subtotal, afterDisc, vat, total } = calcInvoice(
    invoice.items,
    invoice.discount,
    invoice.vatRate,
  );

  let y = 0; // current Y cursor

  // ── PAGE BACKGROUND ────────────────────────────────────────────────────────
  doc.setFillColor(...C.white);
  doc.rect(0, 0, W, H, "F");

  // ── DARK HEADER BAND ──────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 38, "F");

  // ── GOLD DIAMOND LOGO ─────────────────────────────────────────────────────
  // Draw diamond shape using rotated square
  const cx = PAD + 7,
    cy = 14;
  doc.setFillColor(...C.gold);
  doc.saveGraphicsState?.();
  // Draw diamond as rotated rect using lines
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0);
  const pts = [
    [cx, cy - 6],
    [cx + 6, cy],
    [cx, cy + 6],
    [cx - 6, cy],
  ];
  doc.setFillColor(...C.gold);
  doc.triangle(
    pts[0][0],
    pts[0][1],
    pts[1][0],
    pts[1][1],
    pts[3][0],
    pts[3][1],
    "F",
  );
  doc.triangle(
    pts[1][0],
    pts[1][1],
    pts[2][0],
    pts[2][1],
    pts[3][0],
    pts[3][1],
    "F",
  );

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...C.gold);
  doc.text(company.name, PAD + 16, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.subtle);
  doc.text("LUXURY AUTOMOTIVE · DUBAI", PAD + 16, 19);

  // Invoice number — right side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.white);
  doc.text(invoice.invoiceId, W - PAD, 13, { align: "right" });

  // Status badge
  const { bg: sBg, text: sTxt } = getStatusColor(invoice.status);
  const statusLabel = invoice.status.replace("_", " ").toUpperCase();
  doc.setFillColor(...sBg);
  doc.roundedRect(W - PAD - 30, 16, 30, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...sTxt);
  doc.text(statusLabel, W - PAD - 15, 21, { align: "center" });

  y = 44;

  // ── BILL FROM / TO ─────────────────────────────────────────────────────────
  // Left: From
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.subtle);
  doc.text("FROM", PAD, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.text(company.name.name, PAD, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Sheikh Zayed Road, Dubai, UAE", PAD, y + 10);
  doc.text("TRN: 100432687000003", PAD, y + 15);

  // Right: Bill To
  const halfW = W / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.subtle);
  doc.text("BILL TO", halfW, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.text(invoice.customerName, halfW, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(invoice.customerEmail || "—", halfW, y + 10);
  doc.text(`Payment Method: ${invoice.method}`, halfW, y + 15);

  y += 24;

  // ── DATE ROW ───────────────────────────────────────────────────────────────
  doc.setFillColor(...C.lightGray);
  doc.roundedRect(PAD, y, W - PAD * 2, 10, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`Issue Date: ${fmtDate(invoice.issuedDate)}`, PAD + 4, y + 6.5);
  doc.text(`Due Date: ${fmtDate(invoice.dueDate)}`, W / 2, y + 6.5);
  if (invoice.carPlate) {
    doc.text(`Vehicle Plate: ${invoice.carPlate}`, W - PAD - 4, y + 6.5, {
      align: "right",
    });
  }

  y += 16;

  // ── LINE ITEMS TABLE ───────────────────────────────────────────────────────
  const tableBody = invoice.items.map((item) => [
    item.desc,
    item.type.toUpperCase(),
    String(item.qty),
    `AED ${fmtAED(item.unitPrice)}`,
    `AED ${fmtAED(item.qty * item.unitPrice)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Description", "Type", "Qty", "Unit Price", "Total"]],
    body: tableBody,
    margin: { left: PAD, right: PAD },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 4,
      textColor: C.text,
      lineColor: C.borderLight,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: C.dark,
      textColor: C.gold,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: C.lightGray },
    didDrawCell: (data) => {
      // Color the Type cell badge
      if (data.column.index === 1 && data.section === "body") {
        const type = invoice.items[data.row.index]?.type;
        const bgCol =
          type === "car"
            ? C.carBg
            : type === "service"
              ? C.serviceBg
              : C.customBg;
        const txCol =
          type === "car"
            ? C.carText
            : type === "service"
              ? C.serviceText
              : C.customText;
        const { x, y: cy, width, height } = data.cell;
        doc.setFillColor(...bgCol);
        doc.roundedRect(x + 1, cy + 1.5, width - 2, height - 3, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...txCol);
        doc.text(type.toUpperCase(), x + width / 2, cy + height / 2 + 0.5, {
          align: "center",
        });
      }
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── TOTALS ─────────────────────────────────────────────────────────────────
  const totalsX = W - PAD - 60;
  const totalsWidth = 60;

  const drawTotalRow = (label, value, isBold = false, color = C.muted) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 10 : 8.5);
    doc.setTextColor(...color);
    doc.text(label, totalsX, y);
    doc.text(value, totalsX + totalsWidth, y, { align: "right" });
    y += 5.5;
  };

  doc.setDrawColor(...C.borderLight);
  doc.setLineWidth(0.3);
  doc.line(totalsX, y, totalsX + totalsWidth, y);
  y += 4;

  drawTotalRow("Subtotal", `AED ${fmtAED(subtotal)}`);
  if (invoice.discount > 0) {
    drawTotalRow(
      "Discount",
      `− AED ${fmtAED(invoice.discount)}`,
      false,
      [5, 150, 105],
    );
  }
  drawTotalRow(
    `VAT (${invoice.vatRate}%)`,
    `AED ${fmtAED(vat)}`,
    false,
    C.gold,
  );

  y += 1;
  doc.setLineWidth(0.3);
  doc.line(totalsX, y, totalsX + totalsWidth, y);
  y += 4;

  drawTotalRow("TOTAL DUE", `AED ${fmtAED(total)}`, true, C.text);

  y += 8;

  // ── NOTES ──────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    doc.setFillColor(...C.lightGray);
    doc.roundedRect(PAD, y, W - PAD * 2, 18, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.subtle);
    doc.text("NOTES", PAD + 3, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    const splitNotes = doc.splitTextToSize(invoice.notes, W - PAD * 2 - 6);
    doc.text(splitNotes, PAD + 3, y + 10);
    y += 22;
  }

  // ── FOOTER BAND ────────────────────────────────────────────────────────────
  const footerY = H - 28;
  doc.setFillColor(...C.dark);
  doc.rect(0, footerY, W, 28, "F");

  // Bank details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.subtle);
  doc.text("BANK DETAILS", PAD, footerY + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text(
    "Emirates NBD  ·  IBAN: AE07 0260 0010 0246 8003 6  ·  SWIFT: EBILAEAD",
    PAD,
    footerY + 13,
  );

  // Thank you
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.gold);
  doc.text("Thank you for your business", W - PAD, footerY + 7, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.subtle);
  doc.text(
    company.name,
    "·  apexdriveos.ae  ·  Dubai, UAE",
    W - PAD,
    footerY + 13,
    { align: "right" },
  );

  // Page number
  doc.setFontSize(7);
  doc.setTextColor(...C.subtle);
  doc.text(
    `Page 1 of 1  ·  Generated ${new Date().toLocaleDateString("en-AE")}`,
    W / 2,
    footerY + 22,
    { align: "center" },
  );

  // ── SAVE ───────────────────────────────────────────────────────────────────
  doc.save(`${invoice.invoiceId}-${DEFAULT_COMPANY_INFO.name}.pdf`);
}
