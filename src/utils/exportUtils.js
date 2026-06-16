// src/utils/exportUtils.js
// Handles Excel and PDF export for any module.
// Usage: exportToExcel(data, columns, filename)
//        exportToPDF(data, columns, title, filename)

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── EXCEL EXPORT ──────────────────────────────────────────────────────────────
// data     → array of objects
// columns  → [{ id, label }] — which fields to include + their header labels
// filename → e.g. 'apex-gt-inventory'
export function exportToExcel(data, columns, filename = "export") {
  // Build rows — each row is an object with column labels as keys
  const rows = data.map((row) => {
    const out = {};
    columns.forEach((col) => {
      out[col.label] = getCellValue(col.id, row);
    });
    return out;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  // Auto-size columns
  const colWidths = columns.map((col) => ({
    wch: Math.max(col.label.length, 15),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${filename}-${dateStamp()}.xlsx`);
}

// ── PDF EXPORT ────────────────────────────────────────────────────────────────
export function exportToPDF(
  data,
  columns,
  title = "APEX GT",
  filename = "export",
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(11, 15, 20);
  doc.rect(0, 0, doc.internal.pageSize.width, 20, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("APEX GT", 14, 13);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 19);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-AE")}`,
    doc.internal.pageSize.width - 14,
    13,
    { align: "right" },
  );
  doc.text(
    `Total: ${data.length} records`,
    doc.internal.pageSize.width - 14,
    19,
    { align: "right" },
  );

  const headers = columns.map((col) => col.label);
  const rows = data.map((row) =>
    columns.map((col) => getCellValue(col.id, row)),
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [13, 21, 38],
      textColor: [212, 175, 55],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    rowStyles: {
      fillColor: [255, 255, 255],
    },
    margin: { top: 25, left: 14, right: 14 },
  });

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `APEX GT · Confidential · Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 5,
      { align: "center" },
    );
  }

  doc.save(`${filename}-${dateStamp()}.pdf`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function dateStamp() {
  return new Date().toISOString().split("T")[0];
}

// Extracts a plain string value from a row for a given column id.
// Add cases here as new modules are added.
function getCellValue(colId, row) {
  switch (colId) {
    // ── Inventory ──
    case "car":
      return `${row.brand || ""} ${row.model || ""}`.trim();
    case "image":
      return "";
    case "status":
      return row.status || "";
    case "price": {
      // Export the final price after discount, not just unit price
      const discount = Number(row.discount || 0);
      const price = Number(row.price || 0);
      const finalPrice = price - discount;
      return row.price
        ? `${row.currency || "AED"} ${finalPrice.toLocaleString()}`
        : "";
    }

    case "finalPrice": {
      const discount = Number(row.discount || 0);
      const price = Number(row.price || 0);
      return `${row.currency || "AED"} ${(price - discount).toLocaleString()}`;
    }
    case "fuel":
      return row.fuel || row.fuelType || "";
    case "mileage":
      return row.mileage ? `${Number(row.mileage).toLocaleString()} km` : "";
    case "transmission":
      return row.transmission || "";
    case "plate":
      return row.plate || "";
    case "year":
      return row.year || "";
    case "category":
      return row.bodyType || row.category || "";

    // ── Customers ──
    case "customer":
      return row.name || "";
    case "mobile":
      return `${row.mobileCode || ""} ${row.mobile || ""}`.trim();
    case "source":
      return row.source || "";
    case "purchases":
      return row.purchases?.length?.toString() || "0";
    case "spent": {
      const s = row.purchases?.reduce((acc, p) => acc + p.amount, 0) || 0;
      return s > 0 ? `AED ${s.toLocaleString()}` : "0";
    }
    case "dob":
      return row.dob || "";
    case "instagram":
      return row.instagram || "";
    case "customerId":
      return row.customerId || "";

    // Add these cases to getCellValue() in exportUtils.js:
    case "bookingId":
      return row.bookingId || "";
    case "customerName":
      return row.customerName || "";
    case "carName":
      return row.carName || "";
    case "time":
      return row.time || "";
    case "duration":
      return row.duration || "";
    case "exec":
      return row.exec || "";
    case "location":
      return row.location || "";
    case "source":
      return row.source || "";

    // Add these cases to getCellValue():
    case "invoiceId":
      return row.invoiceId || "";
    case "customerName":
      return row.customerName || "";
    case "carName":
      return row.carName || "";
    case "issuedDate":
      return row.issuedDate || "";
    case "dueDate":
      return row.dueDate || "";
    case "method":
      return row.method || "";
    case "total":
      return row.total ? `AED ${Number(row.total).toLocaleString()}` : "";

    // ── Generic fallback ──
    default:
      return row[colId] !== undefined ? String(row[colId]) : "";
  }
}
